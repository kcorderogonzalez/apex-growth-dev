import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select

from app.api import chat, health
from app.api import auth as auth_router
from app.api import users as users_router
from app.api import territories as territories_router
from app.api import memory_library as memory_library_router
from app.api import inbound_leads as inbound_leads_router
from app.config import settings
from app.core.security import hash_password
from app.db.database import AsyncSessionLocal, Base, engine
from app.middleware.logging import StructuredLoggingMiddleware
from app.models import user as _user_models  # noqa: F401 — registers models with Base
from app.models import territory as _territory_models  # noqa: F401 — registers Territory + Account with Base
from app.models import memory_library as _memory_library_models  # noqa: F401 — registers Memory models with Base
from app.models import inbound_lead as _inbound_lead_models  # noqa: F401 — registers InboundLead with Base

logging.basicConfig(
    stream=sys.stdout,
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(message)s" if settings.ENVIRONMENT != "local" else "%(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def _migrate_users_territory_id() -> None:
    """Idempotent: add territory_id column to users if it doesn't exist yet."""
    async with engine.begin() as conn:
        await conn.execute(
            __import__("sqlalchemy").text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS territory_id UUID REFERENCES territories(id) ON DELETE SET NULL"
            )
        )


async def _migrate_inbound_leads() -> None:
    """Idempotent: add AI enrichment columns to inbound_leads if they don't exist yet."""
    new_cols = [
        ("processing_status",   "VARCHAR(20)  DEFAULT 'pending'"),
        ("routing_queue",       "VARCHAR(30)"),
        ("contact_validated",   "BOOLEAN DEFAULT FALSE"),
        ("is_existing_customer","BOOLEAN DEFAULT FALSE"),
        ("persona_tier",        "VARCHAR(50)"),
        ("intent_signal",       "VARCHAR(20)"),
        ("priority_score",      "INTEGER"),
        ("recommended_action",  "VARCHAR(200)"),
        ("campaign_sequence",   "VARCHAR(100)"),
        ("sdr_ready_notes",     "TEXT"),
    ]
    async with engine.begin() as conn:
        for col, col_type in new_cols:
            await conn.execute(
                __import__("sqlalchemy").text(
                    f"ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS {col} {col_type}"
                )
            )


async def _seed_territories() -> None:
    from app.models.territory import Territory
    from app.seed.territories import TERRITORY_SEEDS

    async with AsyncSessionLocal() as session:
        existing_names = set(
            r[0] for r in (await session.execute(select(Territory.name))).all()
        )
        added = 0
        for t in TERRITORY_SEEDS:
            if t["name"] not in existing_names:
                session.add(Territory(**t))
                added += 1
        if added:
            await session.commit()
            logger.info("🗺️  Seeded %d new territories", added)
        else:
            logger.info("All territories already present — skipping seed")


_TERRITORY_USERS = [
    # (territory_name, rsm_name, rsm_email, sdr_name, sdr_email)
    ("Northwest",           "Arlene McCoy",    "rsm.northwest@netskope.com",      "Tyler Nash",    "sdr.northwest@netskope.com"),
    ("Northern California", "Jerome Bell",     "rsm.ncalifornia@netskope.com",    "Maria Santos",  "sdr.ncalifornia@netskope.com"),
    ("Southern California", "Sandra Torres",   "rsm.scalifornia@netskope.com",    "Jordan Kim",    "sdr.scalifornia@netskope.com"),
    ("Southwest",           "Guy Hawkins",     "rsm.southwest@netskope.com",      "Alex Rivera",   "sdr.southwest@netskope.com"),
    ("Mountain",            "Bessie Richards", "rsm.mountain@netskope.com",       "Casey Webb",    "sdr.mountain@netskope.com"),
    ("Great Plains",        "Cody Fisher",     "rsm.greatplains@netskope.com",    "Devon Clark",   "sdr.greatplains@netskope.com"),
    ("Southeast",           "Elena Lopez",     "rsm.southeast@netskope.com",      "Morgan Hayes",  "sdr.southeast@netskope.com"),
    ("New England",         "Robert Fox",      "rsm.newengland@netskope.com",     "Jamie Park",    "sdr.newengland@netskope.com"),
    ("Northeast",           "Patricia Brown",  "rsm.northeast@netskope.com",      "Sam Torres",    "sdr.northeast@netskope.com"),
    ("Mid-Atlantic",        "Jane Cooper",     "rsm.midatlantic@netskope.com",    "Riley Chen",    "sdr.midatlantic@netskope.com"),
    ("Texas",               "Buck Holliday",   "rsm.texas@netskope.com",          "Shay Morales",  "sdr.texas@netskope.com"),
]


async def _seed_territory_users() -> None:
    from app.models.territory import Territory
    from app.models.user import SdrRepAssignment, User

    async with AsyncSessionLocal() as session:
        existing_emails = set(
            r[0] for r in (await session.execute(select(User.email))).all()
        )
        pw = hash_password("Apex2024!")
        added = 0
        for territory_name, rsm_name, rsm_email, sdr_name, sdr_email in _TERRITORY_USERS:
            if rsm_email in existing_emails and sdr_email in existing_emails:
                continue

            t = (await session.execute(select(Territory).where(Territory.name == territory_name))).scalar_one_or_none()
            if not t:
                logger.warning("Territory %s not found — skipping user seed for it", territory_name)
                continue

            rsm = sdr = None
            if rsm_email not in existing_emails:
                rsm = User(email=rsm_email, password_hash=pw, full_name=rsm_name,
                           role="rsm", territory=territory_name, territory_id=t.id)
                session.add(rsm)
            if sdr_email not in existing_emails:
                sdr = User(email=sdr_email, password_hash=pw, full_name=sdr_name,
                           role="sdr", territory=territory_name, territory_id=t.id)
                session.add(sdr)
            await session.flush()

            if rsm and sdr:
                session.add(SdrRepAssignment(sdr_id=sdr.id, rep_id=rsm.id))
            elif sdr:
                existing_rsm = (await session.execute(
                    select(User).where(User.email == rsm_email)
                )).scalar_one_or_none()
                if existing_rsm:
                    session.add(SdrRepAssignment(sdr_id=sdr.id, rep_id=existing_rsm.id))
            added += 1

        if added:
            await session.commit()
            logger.info("🧑‍💼 Seeded %d new territory user pairs", added)
        else:
            logger.info("Territory users already up to date — skipping seed")


async def _seed_agent_registry() -> None:
    from app.agents.subagents import (
        HUNTER_SYSTEM, HUNTER_CHAT_SYSTEM, COMP_INTEL_SYSTEM, OUTREACH_WRITER_SYSTEM,
        DEAL_PARSER_SYSTEM, MEETING_SCHEDULER_SYSTEM, MEMORY_AGENT_SYSTEM, MEMORY_PARSER_SYSTEM,
    )
    from app.models.memory_library import AgentRegistryEntry

    REGISTRY_SEEDS = [
        {"intent_key": "hunter",       "display_name": "Hunter Agent",      "description": "Account research: financials, intent, execs, entry sequence", "system_prompt": HUNTER_SYSTEM,            "is_targetable": True},
        {"intent_key": "hunter_chat",  "display_name": "Hunter Chat",       "description": "Follow-up Q&A on Hunter research",                           "system_prompt": HUNTER_CHAT_SYSTEM,       "is_targetable": True},
        {"intent_key": "comp_intel",   "display_name": "Competitive Intel", "description": "Zscaler/PANW positioning, objection handling",                "system_prompt": COMP_INTEL_SYSTEM,        "is_targetable": True},
        {"intent_key": "outreach",     "display_name": "Outreach Writer",   "description": "Email and LinkedIn message drafting",                         "system_prompt": OUTREACH_WRITER_SYSTEM,   "is_targetable": True},
        {"intent_key": "deal_parse",   "display_name": "Deal Parser",       "description": "MEDPICC extraction from natural language",                    "system_prompt": DEAL_PARSER_SYSTEM,       "is_targetable": True},
        {"intent_key": "meeting",      "display_name": "Meeting Scheduler", "description": "Meeting invitation drafting and Salesforce sync",             "system_prompt": MEETING_SCHEDULER_SYSTEM, "is_targetable": True},
        {"intent_key": "memory_agent", "display_name": "Memory Agent",      "description": "Rep preference configuration (infrastructure — not targetable)", "system_prompt": MEMORY_AGENT_SYSTEM,   "is_targetable": False},
        {"intent_key": "memory_parse", "display_name": "Memory Parser",     "description": "Preference parsing (infrastructure — not targetable)",        "system_prompt": MEMORY_PARSER_SYSTEM,     "is_targetable": False},
    ]

    async with AsyncSessionLocal() as session:
        from sqlalchemy import func, select
        count = await session.execute(select(func.count(AgentRegistryEntry.intent_key)))
        if count.scalar() == 0:
            for seed in REGISTRY_SEEDS:
                session.add(AgentRegistryEntry(
                    intent_key=seed["intent_key"],
                    display_name=seed["display_name"],
                    description=seed["description"],
                    system_prompt=seed["system_prompt"],
                    is_active=True,
                    is_targetable=seed["is_targetable"],
                ))
            await session.commit()
            logger.info("🤖 Seeded %d agent registry entries", len(REGISTRY_SEEDS))
        else:
            logger.info("Agent registry already seeded — skipping")


async def _seed_admin() -> None:
    from app.models.user import User

    async with AsyncSessionLocal() as session:
        count = await session.execute(select(func.count(User.id)))
        if count.scalar() == 0:
            admin = User(
                email="admin@netskope.com",
                password_hash=hash_password("Apex2024!"),
                full_name="Admin User",
                role="admin",
            )
            session.add(admin)
            await session.commit()
            logger.info("🔑 Default admin created — admin@netskope.com / Apex2024!")
        else:
            logger.info("Users table has existing records — skipping seed")


async def _seed_inbound_leads() -> None:
    from app.models.inbound_lead import InboundLead
    from app.seed.inbound_leads import generate_leads

    async with AsyncSessionLocal() as session:
        count = (await session.execute(select(func.count(InboundLead.id)))).scalar()
        if count == 0:
            leads = generate_leads(count=200, seed=42)
            for lead_data in leads:
                session.add(InboundLead(**lead_data))
            await session.commit()
            logger.info("📋 Seeded %d inbound leads", len(leads))
        else:
            logger.info("Inbound leads already seeded (%d present) — skipping", count)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Apex Growth OS backend starting — SKIP_AUTH=%s", settings.SKIP_AUTH)

    # Create tables (idempotent — safe to run every startup in dev)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema up to date")
        await _migrate_users_territory_id()
        await _migrate_inbound_leads()
        await _seed_admin()
        await _seed_territories()
        await _seed_territory_users()
        await _seed_agent_registry()
        await _seed_inbound_leads()
    except Exception as exc:
        logger.warning("Database unavailable at startup (%s) — user management endpoints will fail until DB is up", exc.__class__.__name__)
    yield
    logger.info("Shutting down")
    await engine.dispose()


app = FastAPI(
    title="Apex Growth OS — Netskope",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(StructuredLoggingMiddleware)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(auth_router.router, prefix="/auth", tags=["auth"])
app.include_router(users_router.router, prefix="/api/users", tags=["users"])
app.include_router(territories_router.router, prefix="/api/territories", tags=["territories"])
app.include_router(memory_library_router.router, prefix="/api/memory-library", tags=["memory-library"])
app.include_router(memory_library_router.registry_router, prefix="/api/agent-registry", tags=["agent-registry"])
app.include_router(inbound_leads_router.router, prefix="/api/inbound-leads", tags=["inbound-leads"])
