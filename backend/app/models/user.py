import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from app.db.database import Base

VALID_ROLES = {"admin", "ops", "rsm", "rep", "sdr"}


class User(Base):
    __tablename__ = "users"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(320), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False)  # admin | rsm | rep | sdr
    territory = Column(String(100), nullable=True)  # legacy / display cache
    territory_id = Column(PGUUID(as_uuid=True), ForeignKey("territories.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    territory_obj = relationship("Territory", foreign_keys=[territory_id], lazy="joined")

    sdr_assignments = relationship(
        "SdrRepAssignment",
        foreign_keys="SdrRepAssignment.sdr_id",
        back_populates="sdr",
        cascade="all, delete-orphan",
    )
    rep_assignments = relationship(
        "SdrRepAssignment",
        foreign_keys="SdrRepAssignment.rep_id",
        back_populates="rep",
        cascade="all, delete-orphan",
    )


class SdrRepAssignment(Base):
    __tablename__ = "sdr_rep_assignments"
    __table_args__ = (UniqueConstraint("sdr_id", "rep_id", name="uq_sdr_rep"),)

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sdr_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rep_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    sdr = relationship("User", foreign_keys=[sdr_id], back_populates="sdr_assignments")
    rep = relationship("User", foreign_keys=[rep_id], back_populates="rep_assignments")
