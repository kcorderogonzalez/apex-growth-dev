from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

DepartmentEnum = Literal["Sales Ops", "Sales Engineering", "Marketing", "Product Marketing", "Other"]
StatusEnum = Literal["Draft", "Published", "Archived"]


class MemoryVersionOut(BaseModel):
    id: UUID
    memory_id: UUID
    version_number: int
    content: str
    change_summary: str | None
    authored_by: UUID | None
    authored_at: datetime
    is_current: bool
    author_name: str | None = None

    class Config:
        from_attributes = True


class MemoryOut(BaseModel):
    id: UUID
    name: str
    description: str
    department: str
    target_agents: list[str]
    status: str
    current_version_id: UUID | None
    created_by: UUID | None
    created_at: datetime
    updated_at: datetime
    current_version: MemoryVersionOut | None = None
    creator_name: str | None = None

    class Config:
        from_attributes = True


class MemoryCreate(BaseModel):
    name: str
    description: str = ""
    department: DepartmentEnum
    target_agents: list[str] = []
    content: str = ""
    change_summary: str | None = None
    status: StatusEnum = "Draft"


class MemoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    department: DepartmentEnum | None = None
    target_agents: list[str] | None = None
    status: StatusEnum | None = None


class MemoryVersionCreate(BaseModel):
    content: str
    change_summary: str | None = None
    status: StatusEnum | None = None


class AgentRegistryEntryOut(BaseModel):
    intent_key: str
    display_name: str
    description: str
    is_active: bool
    is_targetable: bool

    class Config:
        from_attributes = True
