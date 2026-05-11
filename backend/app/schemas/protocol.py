from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class ProtocolRuleResponse(BaseModel):
    id: int
    order_num: int
    rule_text: str

    class Config:
        from_attributes = True


class ProtocolBase(BaseModel):
    title: str
    short: Optional[str] = None
    icon: Optional[str] = None
    tone: str = "warn"
    status: str = "todo"
    updated_date: Optional[date] = None


class ProtocolCreate(ProtocolBase):
    id: str
    rules: List[str] = []


class ProtocolUpdate(BaseModel):
    title: Optional[str] = None
    short: Optional[str] = None
    icon: Optional[str] = None
    tone: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class ProtocolResponse(ProtocolBase):
    id: str
    is_active: bool = True
    rules: List[ProtocolRuleResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
