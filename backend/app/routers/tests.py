from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.test import TestSession, TestResult
from app.schemas.test import (
    TestSessionCreate, TestSessionUpdate, TestSessionResponse,
    StartTestRequest, StartTestResponse, SubmitTestRequest,
    TestResultResponse, TestResultShort, DailyStatusResponse, TestStats,
)
from app.core.dependencies import get_current_user
from app.core.permissions import require_admin, require_admin_or_master
from app.services import test_service

router = APIRouter(prefix="/tests", tags=["tests"])


@router.get("", response_model=List[TestSessionResponse])
def list_sessions(
    app_source: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(TestSession).filter(TestSession.is_active == True)
    if app_source:
        q = q.filter(TestSession.app_source.in_([app_source, "both"]))
    return q.all()


@router.post("", response_model=TestSessionResponse)
def create_session(req: TestSessionCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    session = TestSession(**req.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.put("/{session_id}", response_model=TestSessionResponse)
def update_session(session_id: int, req: TestSessionUpdate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(session, field, value)
    db.commit()
    db.refresh(session)
    return session


@router.delete("/{session_id}")
def delete_session(session_id: int, current_user: User = require_admin(), db: Session = Depends(get_db)):
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if session:
        session.is_active = False
        db.commit()
    return {"message": "Deleted"}


@router.get("/daily/status", response_model=DailyStatusResponse)
def daily_status(current_user: User = Depends(get_current_user)):
    return DailyStatusResponse(done=current_user.daily_done_today, date=str(date.today()))


@router.post("/start", response_model=StartTestResponse)
def start_test(req: StartTestRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return test_service.start_test(db, current_user, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{session_token}/submit", response_model=TestResultResponse)
def submit_test(session_token: str, req: SubmitTestRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        result = test_service.submit_test(db, session_token, req)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history", response_model=List[TestResultShort])
def test_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(TestResult)
        .filter(TestResult.user_id == current_user.id)
        .order_by(TestResult.date_taken.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/results", response_model=List[TestResultShort])
def all_results(
    user_id: Optional[int] = None,
    test_type: Optional[str] = None,
    section: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    current_user: User = require_admin_or_master(),
    db: Session = Depends(get_db),
):
    q = db.query(TestResult)
    if current_user.role == "master":
        master_user_ids = [u.id for u in db.query(User).filter(User.section == current_user.section).all()]
        q = q.filter(TestResult.user_id.in_(master_user_ids))
    if user_id:
        q = q.filter(TestResult.user_id == user_id)
    if test_type:
        q = q.filter(TestResult.test_type == test_type)
    return q.order_by(TestResult.date_taken.desc()).offset(skip).limit(limit).all()


@router.get("/results/{result_id}", response_model=TestResultResponse)
def get_result(result_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.query(TestResult).filter(TestResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Not found")
    if current_user.role not in ("admin", "master") and result.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return result


@router.get("/{session_id}/questions")
def get_session_questions(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.question import Question
    import random
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Not found")
    all_q = db.query(Question).filter(Question.is_active == True).all()
    questions = random.sample(all_q, min(session.question_count, len(all_q)))
    return [{"id": q.id, "text": q.text, "options": [q.option_1, q.option_2, q.option_3, q.option_4]} for q in questions]


@router.get("/stats", response_model=TestStats)
def test_stats(current_user: User = require_admin_or_master(), db: Session = Depends(get_db)):
    results = db.query(TestResult).all()
    total = len(results)
    passed = sum(1 for r in results if r.passed)
    failed = total - passed
    by_type = {}
    for r in results:
        by_type[r.test_type] = by_type.get(r.test_type, 0) + 1
    return TestStats(
        total_results=total,
        passed=passed,
        failed=failed,
        pass_rate=round(passed / total * 100, 1) if total > 0 else 0,
        by_type=by_type,
        by_section={},
    )
