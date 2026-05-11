from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TrainingBase(BaseModel):
    title: str
    type: str = "course"
    duration_label: Optional[str] = None
    thumbnail_url: Optional[str] = None
    total_lessons: Optional[int] = None


class TrainingCreate(TrainingBase):
    pass


class TrainingUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    duration_label: Optional[str] = None
    thumbnail_url: Optional[str] = None
    total_lessons: Optional[int] = None
    is_active: Optional[bool] = None


class TrainingResponse(TrainingBase):
    id: int
    is_active: bool = True
    progress_pct: Optional[int] = None
    completed_lessons: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UpdateTrainingProgressRequest(BaseModel):
    completed_lessons: int
    progress_pct: int
