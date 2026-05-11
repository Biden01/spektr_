from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

subordinates_table = Table(
    "subordinates",
    Base.metadata,
    Column("master_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("subordinate_id", Integer, ForeignKey("users.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=False)
    initials = Column(String, nullable=True)
    tab_number = Column(String, unique=True, nullable=True)
    phone = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(Enum("employee", "master", "admin", "student", name="user_role"), default="employee")
    app_source = Column(Enum("spektr", "workhelper", "both", name="app_source"), default="both")
    position = Column(String, nullable=True)
    section = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    access_group = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    status = Column(Enum("active", "vacation", "sick", name="user_status"), default="active")
    state = Column(Enum("all_ok", "overdue", name="user_state"), default="all_ok")
    enrolled_course_id = Column(String, nullable=True)
    daily_done_today = Column(Boolean, default=False)
    annual_due_days = Column(Integer, nullable=True)
    medical_due_days = Column(Integer, nullable=True)
    hire_date = Column(Date, nullable=True)
    last_active = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    medical_info = relationship("UserMedicalInfo", back_populates="user", uselist=False, cascade="all, delete-orphan")
    medical_clearances = relationship("MedicalClearance", back_populates="user", cascade="all, delete-orphan")
    work_stats = relationship("UserWorkStats", back_populates="user", uselist=False, cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    test_results = relationship("TestResult", back_populates="user", cascade="all, delete-orphan")
    mood_entries = relationship("MoodEntry", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    subordinates = relationship(
        "User",
        secondary=subordinates_table,
        primaryjoin=id == subordinates_table.c.master_id,
        secondaryjoin=id == subordinates_table.c.subordinate_id,
        backref="masters",
    )


class UserMedicalInfo(Base):
    __tablename__ = "user_medical_info"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    blood_type = Column(String, nullable=True)
    average_blood_pressure = Column(String, nullable=True)

    user = relationship("User", back_populates="medical_info")


class MedicalClearance(Base):
    __tablename__ = "medical_clearances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    expiry_date = Column(Date, nullable=False)
    status = Column(Enum("active", "expiring", "expired", name="clearance_status"), default="active")

    user = relationship("User", back_populates="medical_clearances")


class UserWorkStats(Base):
    __tablename__ = "user_work_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    vacation_days_taken = Column(Integer, default=0)
    total_vacation_days = Column(Integer, default=28)
    safety_violations = Column(Integer, default=0)
    tardiness_count = Column(Integer, default=0)
    remarks = Column(Integer, default=0)
    employees_managed = Column(Integer, nullable=True)
    shifts_this_month = Column(Integer, nullable=True)
    reports_created = Column(Integer, nullable=True)

    user = relationship("User", back_populates="work_stats")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    awarded_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="achievements")
