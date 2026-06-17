import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Territory(Base):
    __tablename__ = "territories"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(500), nullable=True)
    states_covered = Column(String(200), nullable=True)  # comma-separated abbreviations
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    accounts = relationship("Account", back_populates="territory_obj")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), unique=True, nullable=False, index=True)
    type = Column(String(20), nullable=False)          # Customer | Prospect
    industry = Column(String(100), nullable=True)
    tier = Column(String(50), nullable=True)            # Enterprise | Strategic | Mid-Market
    arr = Column(Integer, default=0)
    health_score = Column(Integer, default=0)
    hq_city = Column(String(100), nullable=True)
    hq_state = Column(String(50), nullable=True)
    territory_id = Column(PGUUID(as_uuid=True), ForeignKey("territories.id", ondelete="SET NULL"), nullable=True)
    owner_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    territory_obj = relationship("Territory", back_populates="accounts")
