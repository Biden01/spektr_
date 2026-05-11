from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class TestSessionBase(BaseModel):
    title: str
    type: str = "standard"
    app_source: str = "both"
    time_limit_sec: int = 1800
    pass_pct: int = 70
    max_attempts: int = 3
    question_count: int = 10
    category_id: Optional[str] = None
    lesson_id: Optional[int] = None
    protocol_id: Optional[str] = None


class TestSessionCreate(TestSessionBase):
    pass


class TestSessionUpdate(BaseModel):
    title: Optional[str] = None
    time_limit_sec: Optional[int] = None
    pass_pct: Optional[int] = None
    max_attempts: Optional[int] = None
    question_count: Optional[int] = None
    is_active: Optional[bool] = None


class TestSessionResponse(TestSessionBase):
    id: int
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StartTestRequest(BaseModel):
    type: str
    category_id: Optional[str] = None
    lesson_id: Optional[int] = None
    protocol_id: Optional[str] = None
    session_id: Optional[int] = None


class QuestionInTest(BaseModel):
    id: int
    text: str
    options: List[str]
    image_url: Optional[str] = None
    category_id: Optional[str] = None


class StartTestResponse(BaseModel):
    session_token: str
    test_type: str
    title: str
    questions: List[QuestionInTest]
    time_limit_sec: int
    pass_pct: int
    total: int


class AnswerItem(BaseModel):
    question_id: int
    selected_index: int


class SubmitTestRequest(BaseModel):
    answers: List[AnswerItem]
    duration_sec: int


class TestResultAnswerResponse(BaseModel):
    question_id: Optional[int] = None
    question_text: str
    selected_index: int
    correct_index: int
    is_correct: bool

    class Config:
        from_attributes = True


class TestResultResponse(BaseModel):
    id: int
    user_id: int
    test_type: str
    title: str
    date_taken: datetime
    score: int
    total: int
    pct: int
    passed: bool
    duration_sec: int
    app_source: str
    answers: List[TestResultAnswerResponse] = []

    class Config:
        from_attributes = True


class TestResultShort(BaseModel):
    id: int
    test_type: str
    title: str
    date_taken: datetime
    score: int
    total: int
    pct: int
    passed: bool
    duration_sec: int

    class Config:
        from_attributes = True


class DailyStatusResponse(BaseModel):
    done: bool
    date: str


class TestStats(BaseModel):
    total_results: int
    passed: int
    failed: int
    pass_rate: float
    by_type: dict
    by_section: dict
