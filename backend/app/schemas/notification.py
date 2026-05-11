from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str


class BulkNotificationCreate(BaseModel):
    user_ids: List[int]
    title: str
    message: str


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UnreadCountResponse(BaseModel):
    count: int
