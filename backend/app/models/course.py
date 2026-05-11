from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    direction = Column(String, nullable=True)
    format = Column(String, default="mixed")
    duration_hours = Column(Integer, default=0)
    duration_label = Column(String, nullable=True)
    price_label = Column(String, nullable=True)
    next_start_date = Column(Date, nullable=True)
    instructor = Column(String, nullable=True)
    cover_emoji = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    program_items = relationship("CourseProgramItem", back_populates="course", cascade="all, delete-orphan", order_by="CourseProgramItem.order_num")


class CourseProgramItem(Base):
    __tablename__ = "course_program_items"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    order_num = Column(Integer, default=0)
    item_text = Column(String, nullable=False)

    course = relationship("Course", back_populates="program_items")
