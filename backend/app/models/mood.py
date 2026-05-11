from sqlalchemy import Column, Integer, SmallInteger, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class MoodEntry(Base):
    __tablename__ = "mood_entries"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_mood_user_date"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    mood = Column(SmallInteger, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="mood_entries")
