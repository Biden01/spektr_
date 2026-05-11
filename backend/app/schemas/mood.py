from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class MoodCreate(BaseModel):
    mood: int
    date: Optional[date] = None


class MoodResponse(BaseModel):
    id: int
    user_id: int
    date: date
    mood: int
    created_at: datetime

    class Config:
        from_attributes = True


class MoodHistoryItem(BaseModel):
    date: date
    mood: int

    class Config:
        from_attributes = True


class MoodTodayResponse(BaseModel):
    submitted: bool
    mood: Optional[int] = None
    date: str


class MoodAnalyticsResponse(BaseModel):
    average: float
    distribution: List[dict]
    trend: List[dict]
    total_entries: int


class DepartmentMoodResponse(BaseModel):
    department: str
    average: float
    count: int
