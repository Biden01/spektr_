from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertRuleCreate(BaseModel):
    title: str
    trigger: str = "overdue"
    recipient: str = "employee"
    channel: str = "push"
    active: bool = True


class AlertRuleUpdate(BaseModel):
    title: Optional[str] = None
    trigger: Optional[str] = None
    recipient: Optional[str] = None
    channel: Optional[str] = None
    active: Optional[bool] = None


class AlertRuleResponse(BaseModel):
    id: int
    title: str
    trigger: str
    recipient: str
    channel: str
    active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
