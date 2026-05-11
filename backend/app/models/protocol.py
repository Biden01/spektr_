from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Protocol(Base):
    __tablename__ = "protocols"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    short = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    tone = Column(String, default="warn")
    status = Column(String, default="todo")
    updated_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    rules = relationship("ProtocolRule", back_populates="protocol", cascade="all, delete-orphan", order_by="ProtocolRule.order_num")


class ProtocolRule(Base):
    __tablename__ = "protocol_rules"

    id = Column(Integer, primary_key=True, index=True)
    protocol_id = Column(String, ForeignKey("protocols.id"), nullable=False)
    order_num = Column(Integer, default=0)
    rule_text = Column(String, nullable=False)

    protocol = relationship("Protocol", back_populates="rules")
