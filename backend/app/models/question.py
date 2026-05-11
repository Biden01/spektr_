from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, SmallInteger
from sqlalchemy.sql import func
from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    difficulty = Column(String, default="medium")
    text = Column(String, nullable=False)
    option_1 = Column(String, nullable=False)
    option_2 = Column(String, nullable=False)
    option_3 = Column(String, nullable=False)
    option_4 = Column(String, nullable=False)
    correct_index = Column(SmallInteger, nullable=False)
    explanation = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    app_source = Column(String, default="spektr")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
