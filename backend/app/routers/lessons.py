from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.lesson import Lesson, LessonProgress
from app.models.user import User
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonResponse, LessonProgressResponse, UpdateProgressRequest
from app.core.dependencies import get_current_user
from app.core.permissions import require_admin

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("", response_model=List[LessonResponse])
def list_lessons(
    category_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Lesson).filter(Lesson.is_active == True)
    if category_id:
        q = q.filter(Lesson.category_id == category_id)
    if status:
        q = q.filter(Lesson.status == status)
    return q.offset(skip).limit(limit).all()


@router.post("", response_model=LessonResponse)
def create_lesson(req: LessonCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    lesson = Lesson(**req.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.is_active == True).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Not found")
    return lesson


@router.put("/{lesson_id}", response_model=LessonResponse)
def update_lesson(lesson_id: int, req: LessonUpdate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(lesson, field, value)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{lesson_id}")
def delete_lesson(lesson_id: int, current_user: User = require_admin(), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if lesson:
        lesson.is_active = False
        db.commit()
    return {"message": "Deleted"}


@router.get("/{lesson_id}/progress", response_model=LessonProgressResponse)
def get_progress(lesson_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress = db.query(LessonProgress).filter(
        LessonProgress.lesson_id == lesson_id,
        LessonProgress.user_id == current_user.id,
    ).first()
    if not progress:
        return LessonProgressResponse(lesson_id=lesson_id)
    return progress


@router.put("/{lesson_id}/progress", response_model=LessonProgressResponse)
def update_progress(lesson_id: int, req: UpdateProgressRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress = db.query(LessonProgress).filter(
        LessonProgress.lesson_id == lesson_id,
        LessonProgress.user_id == current_user.id,
    ).first()
    if not progress:
        progress = LessonProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(progress)
    progress.watch_pct = req.watch_pct
    if req.completed is not None:
        progress.completed = req.completed
    elif req.watch_pct >= 90:
        progress.completed = True
    db.commit()
    db.refresh(progress)
    return progress


@router.post("/{lesson_id}/increment-views")
def increment_views(lesson_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Lesson).filter(Lesson.id == lesson_id).update({"views": Lesson.views + 1})
    db.commit()
    return {"message": "ok"}
