from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Mechanism(Base):
    __tablename__ = "mechanisms"

    id = Column(String, primary_key=True)
    profession = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    difficulty = Column(String, default="medium")
    status = Column(String, default="todo")
    dangers = Column(String, nullable=True)
    precautions = Column(String, nullable=True)
    failure_scenarios = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    steps = relationship("MechanismStep", back_populates="mechanism", cascade="all, delete-orphan", order_by="MechanismStep.order_num")


class MechanismStep(Base):
    __tablename__ = "mechanism_steps"

    id = Column(Integer, primary_key=True, index=True)
    mechanism_id = Column(String, ForeignKey("mechanisms.id"), nullable=False)
    order_num = Column(Integer, default=0)
    step_text = Column(String, nullable=False)

    mechanism = relationship("Mechanism", back_populates="steps")
