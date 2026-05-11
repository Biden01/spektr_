from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String, nullable=False)
    text = Column(String, nullable=False)
    tone = Column(String, default="info")
    ip_address = Column(String, nullable=True)
    app_source = Column(String, default="spektr")
    created_at = Column(DateTime, server_default=func.now())
