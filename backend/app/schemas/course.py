from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class CourseProgramItemResponse(BaseModel):
    id: int
    order_num: int
    item_text: str

    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    direction: Optional[str] = None
    format: str = "mixed"
    duration_hours: int = 0
    duration_label: Optional[str] = None
    price_label: Optional[str] = None
    next_start_date: Optional[date] = None
    instructor: Optional[str] = None
    cover_emoji: Optional[str] = None


class CourseCreate(CourseBase):
    id: str
    program: List[str] = []


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    format: Optional[str] = None
    duration_hours: Optional[int] = None
    price_label: Optional[str] = None
    next_start_date: Optional[date] = None
    instructor: Optional[str] = None
    is_active: Optional[bool] = None


class CourseResponse(CourseBase):
    id: str
    is_active: bool = True
    program_items: List[CourseProgramItemResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
