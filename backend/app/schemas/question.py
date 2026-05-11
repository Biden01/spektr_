from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class QuestionBase(BaseModel):
    category_id: str
    difficulty: str = "medium"
    text: str
    option_1: str
    option_2: str
    option_3: str
    option_4: str
    correct_index: int
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    app_source: str = "spektr"


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    category_id: Optional[str] = None
    difficulty: Optional[str] = None
    text: Optional[str] = None
    option_1: Optional[str] = None
    option_2: Optional[str] = None
    option_3: Optional[str] = None
    option_4: Optional[str] = None
    correct_index: Optional[int] = None
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class QuestionResponse(QuestionBase):
    id: int
    is_active: bool = True
    created_at: Optional[datetime] = None

    @property
    def options(self) -> List[str]:
        return [self.option_1, self.option_2, self.option_3, self.option_4]

    class Config:
        from_attributes = True


class QuestionPublic(BaseModel):
    id: int
    text: str
    options: List[str]
    category_id: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class QuestionStats(BaseModel):
    total: int
    by_category: dict
    by_difficulty: dict


class BulkDeleteRequest(BaseModel):
    ids: List[int]
