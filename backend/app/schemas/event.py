from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EventResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    type: str
    text: str
    tone: str
    app_source: str
    created_at: datetime

    class Config:
        from_attributes = True
