from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    duration_sec = Column(Integer, default=0)
    duration_label = Column(String, nullable=True)
    views = Column(Integer, default=0)
    has_test = Column(Boolean, default=False)
    status = Column(String, default="new")
    publish_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    progress = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    watch_pct = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    lesson = relationship("Lesson", back_populates="progress")
