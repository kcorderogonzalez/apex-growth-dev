from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class InboundLeadOut(BaseModel):
    id: UUID
    source: str
    source_detail: Optional[str]
    captured_at: datetime
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    company: Optional[str]
    title: Optional[str]
    company_size: Optional[str]
    industry: Optional[str]
    hq_city: Optional[str]
    hq_state: Optional[str]
    hq_country: str
    annual_revenue: Optional[float]
    message: Optional[str]
    product_interest: Optional[str]
    data_quality_score: float
    lead_tier: str
    is_duplicate: bool
    is_competitor: bool
    # Processing
    processing_status: str
    processed: bool
    processed_at: Optional[datetime]
    assigned_territory: Optional[str]
    assigned_to_role: Optional[str]
    routing_queue: Optional[str]
    contact_validated: bool
    is_existing_customer: bool
    # AI enrichment
    persona_tier: Optional[str]
    intent_signal: Optional[str]
    priority_score: Optional[int]
    recommended_action: Optional[str]
    campaign_sequence: Optional[str]
    sdr_ready_notes: Optional[str]
    agent_notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class InboundLeadPatch(BaseModel):
    processed: Optional[bool] = None
    processed_at: Optional[datetime] = None
    assigned_territory: Optional[str] = None
    assigned_to_role: Optional[str] = None
    routing_queue: Optional[str] = None
    agent_notes: Optional[str] = None
