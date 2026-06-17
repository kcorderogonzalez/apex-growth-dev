from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TerritoryResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    states_covered: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AccountResponse(BaseModel):
    id: UUID
    name: str
    type: str
    industry: str | None
    tier: str | None
    arr: int
    health_score: int
    hq_city: str | None
    hq_state: str | None
    territory_id: UUID | None
    territory_name: str | None

    model_config = {"from_attributes": True}
