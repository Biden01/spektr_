from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class MedicalClearanceSchema(BaseModel):
    id: Optional[int] = None
    name: str
    expiry_date: date
    status: str = "active"

    class Config:
        from_attributes = True


class UserMedicalInfoSchema(BaseModel):
    blood_type: Optional[str] = None
    average_blood_pressure: Optional[str] = None
    medical_clearances: List[MedicalClearanceSchema] = []

    class Config:
        from_attributes = True


class UserWorkStatsSchema(BaseModel):
    vacation_days_taken: int = 0
    total_vacation_days: int = 28
    safety_violations: int = 0
    tardiness_count: int = 0
    remarks: int = 0
    employees_managed: Optional[int] = None
    shifts_this_month: Optional[int] = None
    reports_created: Optional[int] = None

    class Config:
        from_attributes = True


class AchievementSchema(BaseModel):
    id: Optional[int] = None
    title: str
    awarded_date: Optional[date] = None

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    full_name: str
    initials: Optional[str] = None
    tab_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str = "employee"
    app_source: str = "both"
    position: Optional[str] = None
    section: Optional[str] = None
    profession: Optional[str] = None
    access_group: Optional[str] = None
    photo_url: Optional[str] = None
    status: str = "active"
    state: str = "all_ok"
    daily_done_today: bool = False
    annual_due_days: Optional[int] = None
    medical_due_days: Optional[int] = None
    hire_date: Optional[date] = None


class UserCreate(UserBase):
    password: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    position: Optional[str] = None
    section: Optional[str] = None
    profession: Optional[str] = None
    access_group: Optional[str] = None
    photo_url: Optional[str] = None
    status: Optional[str] = None
    role: Optional[str] = None
    annual_due_days: Optional[int] = None
    medical_due_days: Optional[int] = None


class UserResponse(UserBase):
    id: int
    slug: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    medical_info: Optional[UserMedicalInfoSchema] = None
    work_stats: Optional[UserWorkStatsSchema] = None
    achievements: List[AchievementSchema] = []

    class Config:
        from_attributes = True


class UserShort(BaseModel):
    id: int
    full_name: str
    role: str
    position: Optional[str] = None
    section: Optional[str] = None
    photo_url: Optional[str] = None
    state: str = "all_ok"
    daily_done_today: bool = False

    class Config:
        from_attributes = True


class BulkNotifyRequest(BaseModel):
    user_ids: List[int]
    title: str
    message: str
