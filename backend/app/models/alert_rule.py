from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    trigger = Column(String, nullable=False, default="overdue")
    recipient = Column(String, nullable=False, default="employee")
    channel = Column(String, nullable=False, default="push")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
