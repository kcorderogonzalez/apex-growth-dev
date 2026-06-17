import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID as PGUUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Memory(Base):
    __tablename__ = "memories"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    description = Column(String(500), nullable=False, default="")
    department = Column(String(50), nullable=False)
    target_agents = Column(ARRAY(String), nullable=False, default=list)
    status = Column(String(20), nullable=False, default="Draft")
    current_version_id = Column(PGUUID(as_uuid=True), ForeignKey("memory_versions.id", use_alter=True, name="fk_memory_current_version"), nullable=True)
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    versions = relationship("MemoryVersion", foreign_keys="MemoryVersion.memory_id", back_populates="memory", cascade="all, delete-orphan")
    current_version = relationship("MemoryVersion", foreign_keys=[current_version_id], post_update=True)
    creator = relationship("User", foreign_keys=[created_by])


class MemoryVersion(Base):
    __tablename__ = "memory_versions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    memory_id = Column(PGUUID(as_uuid=True), ForeignKey("memories.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False, default="")
    change_summary = Column(String(500), nullable=True)
    authored_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    authored_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_current = Column(Boolean, nullable=False, default=False)

    memory = relationship("Memory", foreign_keys=[memory_id], back_populates="versions")
    author = relationship("User", foreign_keys=[authored_by])


class AgentRegistryEntry(Base):
    __tablename__ = "agent_registry"

    intent_key = Column(String(100), primary_key=True)
    display_name = Column(String(200), nullable=False)
    description = Column(String(500), nullable=False, default="")
    system_prompt = Column(Text, nullable=False, default="")
    is_active = Column(Boolean, nullable=False, default=True)
    is_targetable = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
