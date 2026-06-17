"""
Inbound Lead Management API — PG-INBOUND

Three endpoints:
  GET  /api/inbound-leads        — paginated lead queue for the current user
  GET  /api/inbound-leads/stats  — queue counts
  POST /api/inbound-leads/process — trigger AI enrichment on pending leads
"""

import json
import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.subagents import INBOUND_LEAD_SYSTEM
from app.config import settings
from app.db.database import AsyncSessionLocal, get_db
from app.dependencies import get_current_user
from app.models.inbound_lead import InboundLead
from app.schemas.inbound_lead import InboundLeadOut

logger = logging.getLogger(__name__)
router = APIRouter()

# ─── Territory routing constants ────────────────────────────────────────────────

STATE_TO_TERRITORY: dict[str, str] = {
    "WA": "Northwest", "OR": "Northwest", "ID": "Northwest", "AK": "Northwest",
    "AZ": "Southwest", "NV": "Southwest", "NM": "Southwest", "UT": "Southwest", "HI": "Southwest",
    "CO": "Mountain", "WY": "Mountain", "MT": "Mountain",
    "OK": "Great Plains", "KS": "Great Plains", "NE": "Great Plains", "MN": "Great Plains",
    "IA": "Great Plains", "MO": "Great Plains", "WI": "Great Plains", "IL": "Great Plains",
    "MI": "Great Plains", "IN": "Great Plains", "OH": "Great Plains", "AR": "Great Plains",
    "ND": "Great Plains", "SD": "Great Plains",
    "FL": "Southeast", "GA": "Southeast", "AL": "Southeast", "MS": "Southeast",
    "TN": "Southeast", "SC": "Southeast", "NC": "Southeast", "LA": "Southeast",
    "KY": "Southeast",
    "MA": "New England", "CT": "New England", "RI": "New England", "VT": "New England",
    "NH": "New England", "ME": "New England",
    "NY": "Northeast", "NJ": "Northeast", "PA": "Northeast", "DE": "Northeast",
    "DC": "Mid-Atlantic", "MD": "Mid-Atlantic", "VA": "Mid-Atlantic", "WV": "Mid-Atlantic",
    "TX": "Texas",
}

NORCAL_CITIES = {
    "San Francisco", "San Jose", "Oakland", "Santa Clara", "Sunnyvale",
    "Mountain View", "Palo Alto", "Redwood City", "Menlo Park", "Foster City",
    "Fremont", "Berkeley", "Sacramento", "Stockton", "San Mateo", "Newark",
    "Pleasanton", "Milpitas", "Cupertino", "Los Altos", "Campbell",
}

SOCAL_CITIES = {
    "Los Angeles", "San Diego", "Irvine", "Anaheim", "Santa Ana",
    "Riverside", "San Bernardino", "Oxnard", "Thousand Oaks", "Long Beach",
    "Pasadena", "Torrance", "Hawthorne", "Burbank", "Santa Monica",
}


def _resolve_territory(city: str | None, state: str | None, country: str) -> str | None:
    if country != "United States":
        return None  # routes to needs_resolution for Data Ops
    if not state:
        return None
    if state == "CA":
        if city and city in NORCAL_CITIES:
            return "Northern California"
        if city and city in SOCAL_CITIES:
            return "Southern California"
        return None  # ambiguous CA city — needs resolution
    return STATE_TO_TERRITORY.get(state)


def _deterministic_routing(lead: InboundLead, territory: str | None, existing_customer: bool) -> dict:
    """Apply rules-based routing. Returns dict of fields to update."""
    contact_validated = bool(lead.email) and lead.data_quality_score >= 0.40

    # Disqualify tiers
    if lead.lead_tier in ("JUNK", "DUPLICATE"):
        return {
            "routing_queue": "disqualified",
            "assigned_to_role": None,
            "assigned_territory": None,
            "contact_validated": contact_validated,
            "is_existing_customer": existing_customer,
        }

    if lead.lead_tier == "TOO_SMALL":
        return {
            "routing_queue": "disqualified",
            "assigned_to_role": None,
            "assigned_territory": None,
            "contact_validated": contact_validated,
            "is_existing_customer": existing_customer,
        }

    # International → Data Ops resolution queue
    if lead.hq_country != "United States":
        return {
            "routing_queue": "needs_resolution",
            "assigned_to_role": None,
            "assigned_territory": None,
            "contact_validated": contact_validated,
            "is_existing_customer": existing_customer,
        }

    # Territory unresolvable → Data Ops resolution queue
    if not territory:
        return {
            "routing_queue": "needs_resolution",
            "assigned_to_role": None,
            "assigned_territory": None,
            "contact_validated": contact_validated,
            "is_existing_customer": existing_customer,
        }

    # Contact data insufficient → low quality queue
    if not contact_validated:
        return {
            "routing_queue": "low_quality",
            "assigned_to_role": None,
            "assigned_territory": territory,
            "contact_validated": False,
            "is_existing_customer": existing_customer,
        }

    # Existing customer → disqualify (already in system)
    if existing_customer:
        return {
            "routing_queue": "disqualified",
            "assigned_to_role": None,
            "assigned_territory": territory,
            "contact_validated": contact_validated,
            "is_existing_customer": True,
        }

    # Route to RSM or SDR based on tier
    if lead.lead_tier == "RSM_READY":
        return {
            "routing_queue": "rsm",
            "assigned_to_role": "rsm",
            "assigned_territory": territory,
            "contact_validated": True,
            "is_existing_customer": False,
        }

    # SDR_WORTHY (and anything else that passed all filters)
    return {
        "routing_queue": "primary",
        "assigned_to_role": "sdr",
        "assigned_territory": territory,
        "contact_validated": True,
        "is_existing_customer": False,
    }


async def _check_existing_customer(session: AsyncSession, company: str | None) -> bool:
    if not company:
        return False
    from app.models.territory import Account
    result = await session.execute(
        select(Account).where(
            Account.name.ilike(f"%{company}%"),
            Account.type == "Customer",
        ).limit(1)
    )
    return result.scalar_one_or_none() is not None


async def _ai_enrich_batch(leads: list[InboundLead]) -> list[dict]:
    """
    Call Gemini once for a batch of leads, return list of enrichment dicts.
    Falls back to rule-based defaults on any error.
    """
    from google import genai
    from google.genai import types as gtypes

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    lead_payloads = []
    for lead in leads:
        lead_payloads.append({
            "id": str(lead.id),
            "first_name": lead.first_name,
            "last_name": lead.last_name,
            "title": lead.title,
            "company": lead.company,
            "company_size": lead.company_size,
            "industry": lead.industry,
            "source": lead.source,
            "source_detail": lead.source_detail,
            "product_interest": lead.product_interest,
            "message": lead.message,
            "hq_country": lead.hq_country,
            "lead_tier": lead.lead_tier,
            "data_quality_score": lead.data_quality_score,
        })

    prompt = f"Enrich these {len(lead_payloads)} inbound leads:\n\n{json.dumps(lead_payloads, indent=2)}"

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt],
            config=gtypes.GenerateContentConfig(
                system_instruction=INBOUND_LEAD_SYSTEM,
                temperature=0.2,
            ),
        )
        raw = response.text.strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        enrichments = json.loads(raw)
        if isinstance(enrichments, list):
            return enrichments
    except Exception as exc:
        logger.warning("AI enrichment batch failed: %s", exc)

    # Fallback: rule-based defaults
    fallbacks = []
    for lead in leads:
        tier = lead.lead_tier
        score = 50
        persona = "Manager / IC"
        intent = "Low"
        action = "Review — Low Signal"
        sequence = None

        if tier == "RSM_READY":
            score = 88
            persona = "C-Suite / VP"
            intent = "High"
            action = "Start Enterprise Sequence"
            sequence = "SSE Awareness — Cold Outbound"
        elif tier == "SDR_WORTHY":
            score = 62
            persona = "Manager / IC"
            intent = "Medium"
            action = "Start SDR Qualification Sequence"
            sequence = "ZTNA Discovery — Mid-Market"
        elif tier in ("JUNK", "TOO_SMALL", "DUPLICATE"):
            score = 5
            persona = "Junk"
            intent = "None"
            action = f"Disqualify — {tier.replace('_', ' ').title()}"
            sequence = None
        elif tier == "INTERNATIONAL":
            score = 30
            persona = "Manager / IC"
            intent = "Low"
            action = "Route to International Team"
            sequence = None

        fallbacks.append({
            "id": str(lead.id),
            "persona_tier": persona,
            "intent_signal": intent,
            "priority_score": score,
            "recommended_action": action,
            "campaign_sequence": sequence,
            "sdr_ready_notes": f"{tier.replace('_', ' ').title()} lead — review before outreach.",
        })
    return fallbacks


# ─── Background processing ──────────────────────────────────────────────────────

async def _process_leads_batch(batch_size: int = 25) -> int:
    """Process up to `batch_size` pending leads. Returns count processed."""
    async with AsyncSessionLocal() as session:
        # Claim a batch atomically
        result = await session.execute(
            select(InboundLead)
            .where(InboundLead.processing_status == "pending")
            .order_by(InboundLead.captured_at.desc())
            .limit(batch_size)
        )
        leads: list[InboundLead] = list(result.scalars().all())
        if not leads:
            return 0

        # Mark as processing to prevent double-processing
        lead_ids = [l.id for l in leads]
        await session.execute(
            update(InboundLead)
            .where(InboundLead.id.in_(lead_ids))
            .values(processing_status="processing")
        )
        await session.commit()

    async with AsyncSessionLocal() as session:
        # Re-fetch inside fresh session
        result = await session.execute(
            select(InboundLead).where(InboundLead.id.in_(lead_ids))
        )
        leads = list(result.scalars().all())

        # Deterministic routing for each
        routing_map: dict[UUID, dict] = {}
        for lead in leads:
            territory = _resolve_territory(lead.hq_city, lead.hq_state, lead.hq_country)
            existing = await _check_existing_customer(session, lead.company)
            routing_map[lead.id] = _deterministic_routing(lead, territory, existing)

        # AI enrichment for the whole batch
        enrichments = await _ai_enrich_batch(leads)
        enrichment_map: dict[str, dict] = {e["id"]: e for e in enrichments if "id" in e}

        now = datetime.now(timezone.utc)
        processed_count = 0

        for lead in leads:
            routing = routing_map.get(lead.id, {})
            ai = enrichment_map.get(str(lead.id), {})

            lead.processing_status = "done"
            lead.processed = True
            lead.processed_at = now
            lead.assigned_territory = routing.get("assigned_territory")
            lead.assigned_to_role = routing.get("assigned_to_role")
            lead.routing_queue = routing.get("routing_queue", "disqualified")
            lead.contact_validated = routing.get("contact_validated", False)
            lead.is_existing_customer = routing.get("is_existing_customer", False)
            lead.persona_tier = ai.get("persona_tier")
            lead.intent_signal = ai.get("intent_signal")
            lead.priority_score = ai.get("priority_score")
            lead.recommended_action = ai.get("recommended_action")
            lead.campaign_sequence = ai.get("campaign_sequence")
            lead.sdr_ready_notes = ai.get("sdr_ready_notes")

            session.add(lead)
            processed_count += 1

        await session.commit()
        return processed_count


# ─── Endpoints ──────────────────────────────────────────────────────────────────

class ProcessResponse(BaseModel):
    processed: int
    pending_remaining: int


class StatsResponse(BaseModel):
    pending: int
    primary: int
    rsm: int
    needs_resolution: int
    low_quality: int
    disqualified: int
    total_processed: int


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    from sqlalchemy import func as sqlfunc

    result = await db.execute(
        select(InboundLead.routing_queue, InboundLead.processing_status, sqlfunc.count(InboundLead.id))
        .group_by(InboundLead.routing_queue, InboundLead.processing_status)
    )
    rows = result.all()

    counts: dict[str, int] = {}
    pending = 0
    for queue, status, count in rows:
        if status == "pending" or status == "processing":
            pending += count
        else:
            counts[queue or "disqualified"] = counts.get(queue or "disqualified", 0) + count

    return StatsResponse(
        pending=pending,
        primary=counts.get("primary", 0),
        rsm=counts.get("rsm", 0),
        needs_resolution=counts.get("needs_resolution", 0),
        low_quality=counts.get("low_quality", 0),
        disqualified=counts.get("disqualified", 0),
        total_processed=sum(counts.values()),
    )


@router.get("", response_model=list[InboundLeadOut])
async def list_leads(
    queue: Optional[str] = Query(None, description="primary | rsm | needs_resolution | low_quality | disqualified"),
    territory: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    q = select(InboundLead).where(InboundLead.processing_status == "done")

    if queue:
        q = q.where(InboundLead.routing_queue == queue)

    # Territory filter: if user has a territory, scope to it (unless admin/ops)
    user_role = user.get("role", "")
    user_territory = territory or user.get("territory")
    if user_territory and user_role not in ("admin", "ops"):
        q = q.where(InboundLead.assigned_territory == user_territory)

    q = q.order_by(InboundLead.priority_score.desc().nulls_last(), InboundLead.captured_at.desc())
    q = q.limit(limit).offset(offset)

    result = await db.execute(q)
    return result.scalars().all()


@router.post("/process", response_model=ProcessResponse)
async def process_leads(
    batch_size: int = Query(25, le=100, description="Max leads to process in this call"),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    processed = await _process_leads_batch(batch_size=batch_size)

    # Count remaining pending
    result = await db.execute(
        select(InboundLead).where(
            InboundLead.processing_status.in_(["pending", "processing"])
        )
    )
    remaining = len(result.scalars().all())

    return ProcessResponse(processed=processed, pending_remaining=remaining)
