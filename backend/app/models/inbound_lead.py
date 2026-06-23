import uuid

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.db.database import Base


class InboundLead(Base):
    __tablename__ = "inbound_leads"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Source
    source = Column(String(50), nullable=False)
    source_detail = Column(String(200), nullable=True)

    # Simulated arrival time — agent queries "newer than last check"
    captured_at = Column(DateTime(timezone=True), nullable=False)

    # Contact — intentionally messy (nulls, bad data)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    email = Column(String(320), nullable=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(200), nullable=True)
    title = Column(String(200), nullable=True)

    # Firmographic — often incomplete
    company_size = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=True)
    hq_city = Column(String(100), nullable=True)
    hq_state = Column(String(50), nullable=True)
    hq_country = Column(String(100), nullable=False, default="United States")
    annual_revenue = Column(Float, nullable=True)

    # Intent
    message = Column(Text, nullable=True)
    product_interest = Column(String(100), nullable=True)

    # Quality metadata
    data_quality_score = Column(Float, nullable=False, default=0.5)
    lead_tier = Column(String(30), nullable=False)
    is_duplicate = Column(Boolean, default=False, nullable=False)
    is_competitor = Column(Boolean, default=False, nullable=False)

    # Deterministic routing (computed without AI)
    processing_status = Column(String(20), nullable=False, default="pending")  # pending | processing | done | failed
    processed = Column(Boolean, default=False, nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    assigned_territory = Column(String(100), nullable=True)
    assigned_to_role = Column(String(20), nullable=True)   # rsm | sdr | null
    routing_queue = Column(String(30), nullable=True)      # primary | rsm | needs_resolution | low_quality | disqualified
    contact_validated = Column(Boolean, default=False, nullable=False)
    is_existing_customer = Column(Boolean, default=False, nullable=False)

    # Lead vs Contact classification
    account_match = Column(Boolean, default=False, nullable=False)
    meeting_secured = Column(Boolean, default=False, nullable=False)

    # Marketo enrichment
    marketo_signal = Column(String(5), nullable=True)      # alphanumeric signal e.g. "A1" (letter=ICP fit, number=activity)
    marketo_program = Column(String(200), nullable=True)   # originating Marketo program/campaign

    # AI-generated enrichment
    persona_tier = Column(String(50), nullable=True)       # C-Suite / VP | Director | Manager / IC | Technical IC | Non-Target | Junk
    intent_signal = Column(String(20), nullable=True)      # High | Medium | Low | None
    priority_score = Column(Integer, nullable=True)        # 0–100
    recommended_action = Column(String(200), nullable=True)
    campaign_sequence = Column(String(100), nullable=True)
    sdr_ready_notes = Column(Text, nullable=True)
    agent_notes = Column(Text, nullable=True)              # raw agent output / errors

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
