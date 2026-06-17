from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str  # admin | rsm | rep | sdr
    territory: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: str | None = None
    territory: str | None = None
    is_active: bool | None = None
    password: str | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    territory: str | None
    is_active: bool
    created_at: datetime
    last_login: datetime | None

    model_config = {"from_attributes": True}


class AssignmentCreate(BaseModel):
    rep_id: UUID


class AssignmentResponse(BaseModel):
    id: UUID
    sdr_id: UUID
    rep_id: UUID
    rep_name: str
    rep_email: str
    created_at: datetime

    model_config = {"from_attributes": True}
