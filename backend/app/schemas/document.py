from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class DocumentBase(BaseModel):
    title: str
    category: Optional[str] = None
    app_source: str = "spektr"
    lesson_id: Optional[int] = None
    section: Optional[str] = None
    profession: Optional[str] = None
    file_url: Optional[str] = None
    file_format: str = "PDF"
    file_size_label: Optional[str] = None
    pages: Optional[int] = None
    updated_at: Optional[date] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    section: Optional[str] = None
    profession: Optional[str] = None
    file_url: Optional[str] = None
    file_format: Optional[str] = None
    file_size_label: Optional[str] = None
    pages: Optional[int] = None
    is_active: Optional[bool] = None


class DocumentResponse(DocumentBase):
    id: int
    is_active: bool = True
    created_at: Optional[datetime] = None
    read: Optional[bool] = None

    class Config:
        from_attributes = True


class DocumentStats(BaseModel):
    total: int
    most_read: list
