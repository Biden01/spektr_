from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, SmallInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class TestSession(Base):
    __tablename__ = "test_sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, default="standard")
    app_source = Column(String, default="both")
    time_limit_sec = Column(Integer, default=1800)
    pass_pct = Column(Integer, default=70)
    max_attempts = Column(Integer, default=3)
    question_count = Column(Integer, default=10)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    lesson_id = Column(Integer, nullable=True)
    protocol_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    results = relationship("TestResult", back_populates="session")


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("test_sessions.id"), nullable=True)
    test_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    date_taken = Column(DateTime, server_default=func.now())
    score = Column(Integer, default=0)
    total = Column(Integer, default=0)
    pct = Column(Integer, default=0)
    passed = Column(Boolean, default=False)
    duration_sec = Column(Integer, default=0)
    app_source = Column(String, default="spektr")

    user = relationship("User", back_populates="test_results")
    session = relationship("TestSession", back_populates="results")
    answers = relationship("TestResultAnswer", back_populates="result", cascade="all, delete-orphan")


class TestResultAnswer(Base):
    __tablename__ = "test_result_answers"

    id = Column(Integer, primary_key=True, index=True)
    result_id = Column(Integer, ForeignKey("test_results.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    question_text = Column(String, nullable=False)
    selected_index = Column(SmallInteger, nullable=False)
    correct_index = Column(SmallInteger, nullable=False)
    is_correct = Column(Boolean, nullable=False)

    result = relationship("TestResult", back_populates="answers")
