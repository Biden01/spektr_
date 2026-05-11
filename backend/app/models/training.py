from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class TrainingMaterial(Base):
    __tablename__ = "training_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, default="course")
    duration_label = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    total_lessons = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    progress = relationship("TrainingProgress", back_populates="material", cascade="all, delete-orphan")


class TrainingProgress(Base):
    __tablename__ = "training_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    material_id = Column(Integer, ForeignKey("training_materials.id"), nullable=False)
    completed_lessons = Column(Integer, default=0)
    progress_pct = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    material = relationship("TrainingMaterial", back_populates="progress")
