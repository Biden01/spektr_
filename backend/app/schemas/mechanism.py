from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MechanismStepResponse(BaseModel):
    id: int
    order_num: int
    step_text: str

    class Config:
        from_attributes = True


class MechanismBase(BaseModel):
    profession: str
    title: str
    description: Optional[str] = None
    difficulty: str = "medium"
    status: str = "todo"
    dangers: Optional[str] = None
    precautions: Optional[str] = None
    failure_scenarios: Optional[str] = None


class MechanismCreate(MechanismBase):
    id: str
    steps: List[str] = []


class MechanismUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class MechanismResponse(MechanismBase):
    id: str
    is_active: bool = True
    steps: List[MechanismStepResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
