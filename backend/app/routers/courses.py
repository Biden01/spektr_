from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.course import Course, CourseProgramItem
from app.models.user import User
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.core.dependencies import get_current_user_optional
from app.core.permissions import require_admin

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=List[CourseResponse])
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).filter(Course.is_active == True).all()


@router.post("", response_model=CourseResponse)
def create_course(req: CourseCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    program = req.program
    data = req.model_dump(exclude={"program"})
    course = Course(**data)
    db.add(course)
    db.flush()
    for i, item in enumerate(program):
        db.add(CourseProgramItem(course_id=course.id, order_num=i, item_text=item))
    db.commit()
    db.refresh(course)
    return course


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id, Course.is_active == True).first()
    if not course:
        raise HTTPException(status_code=404, detail="Not found")
    return course


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(course_id: str, req: CourseUpdate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}")
def delete_course(course_id: str, current_user: User = require_admin(), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if course:
        course.is_active = False
        db.commit()
    return {"message": "Deleted"}


@router.post("/{course_id}/enroll")
def enroll(course_id: str, current_user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    current_user.enrolled_course_id = course_id
    db.commit()
    return {"message": "Enrolled"}
