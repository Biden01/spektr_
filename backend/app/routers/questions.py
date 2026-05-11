from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.question import Question
from app.models.user import User
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse, QuestionStats, BulkDeleteRequest
from app.core.permissions import require_admin

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("", response_model=List[QuestionResponse])
def list_questions(
    category_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    app_source: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    current_user: User = require_admin(),
    db: Session = Depends(get_db),
):
    q = db.query(Question).filter(Question.is_active == True)
    if category_id:
        q = q.filter(Question.category_id == category_id)
    if difficulty:
        q = q.filter(Question.difficulty == difficulty)
    if app_source:
        q = q.filter(Question.app_source == app_source)
    if search:
        q = q.filter(Question.text.ilike(f"%{search}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/stats", response_model=QuestionStats)
def question_stats(current_user: User = require_admin(), db: Session = Depends(get_db)):
    all_q = db.query(Question).filter(Question.is_active == True).all()
    by_cat = {}
    by_diff = {}
    for q in all_q:
        by_cat[q.category_id] = by_cat.get(q.category_id, 0) + 1
        by_diff[q.difficulty] = by_diff.get(q.difficulty, 0) + 1
    return QuestionStats(total=len(all_q), by_category=by_cat, by_difficulty=by_diff)


@router.post("", response_model=QuestionResponse)
def create_question(req: QuestionCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    q = Question(**req.model_dump())
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: int, current_user: User = require_admin(), db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q


@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(question_id: int, req: QuestionUpdate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(q, field, value)
    db.commit()
    db.refresh(q)
    return q


@router.delete("/{question_id}")
def delete_question(question_id: int, current_user: User = require_admin(), db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.is_active = False
    db.commit()
    return {"message": "Deleted"}


@router.post("/bulk-delete")
def bulk_delete(req: BulkDeleteRequest, current_user: User = require_admin(), db: Session = Depends(get_db)):
    db.query(Question).filter(Question.id.in_(req.ids)).update({"is_active": False}, synchronize_session=False)
    db.commit()
    return {"message": f"Deleted {len(req.ids)} questions"}


@router.post("/import")
def import_questions(questions: List[QuestionCreate], current_user: User = require_admin(), db: Session = Depends(get_db)):
    objs = [Question(**q.model_dump()) for q in questions]
    db.add_all(objs)
    db.commit()
    return {"message": f"Imported {len(objs)} questions"}
