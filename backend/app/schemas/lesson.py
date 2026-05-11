from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class LessonBase(BaseModel):
    category_id: str
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    duration_sec: int = 0
    duration_label: Optional[str] = None
    has_test: bool = False
    status: str = "new"
    publish_date: Optional[date] = None


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    duration_sec: Optional[int] = None
    duration_label: Optional[str] = None
    has_test: Optional[bool] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class LessonResponse(LessonBase):
    id: int
    views: int = 0
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LessonProgressResponse(BaseModel):
    lesson_id: int
    watch_pct: int = 0
    completed: bool = False

    class Config:
        from_attributes = True


class UpdateProgressRequest(BaseModel):
    watch_pct: int
    completed: Optional[bool] = None
