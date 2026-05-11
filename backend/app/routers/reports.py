from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, timedelta
from app.database import get_db
from app.models.user import User
from app.models.test import TestResult
from app.models.mood import MoodEntry
from app.core.permissions import require_admin, require_admin_or_master

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/overview")
def overview(current_user: User = require_admin_or_master(), db: Session = Depends(get_db)):
    total_users = db.query(User).filter(User.is_active == True, User.role != "admin").count()
    overdue_count = db.query(User).filter(User.is_active == True, User.state == "overdue").count()
    today = date.today()
    daily_done = db.query(User).filter(User.is_active == True, User.daily_done_today == True).count()
    total_results = db.query(TestResult).count()
    passed = db.query(TestResult).filter(TestResult.passed == True).count()
    return {
        "total_users": total_users,
        "overdue_count": overdue_count,
        "daily_done_today": daily_done,
        "total_test_results": total_results,
        "passed_results": passed,
        "pass_rate": round(passed / total_results * 100, 1) if total_results > 0 else 0,
    }


@router.get("/test-results")
def test_results_report(
    test_type: Optional[str] = None,
    section: Optional[str] = None,
    days: int = 30,
    current_user: User = require_admin_or_master(),
    db: Session = Depends(get_db),
):
    since = date.today() - timedelta(days=days)
    q = db.query(TestResult).filter(TestResult.date_taken >= since)
    if test_type:
        q = q.filter(TestResult.test_type == test_type)
    results = q.all()
    total = len(results)
    passed = sum(1 for r in results if r.passed)
    return {
        "total": total,
        "passed": passed,
        "failed": total - passed,
        "pass_rate": round(passed / total * 100, 1) if total > 0 else 0,
        "results": [{"id": r.id, "user_id": r.user_id, "test_type": r.test_type, "title": r.title, "pct": r.pct, "passed": r.passed, "date_taken": r.date_taken} for r in results],
    }


@router.get("/section-stats")
def section_stats(current_user: User = require_admin_or_master(), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_active == True, User.section != None).all()
    sections = {}
    for u in users:
        s = u.section
        if s not in sections:
            sections[s] = {"total": 0, "overdue": 0, "daily_done": 0}
        sections[s]["total"] += 1
        if u.state == "overdue":
            sections[s]["overdue"] += 1
        if u.daily_done_today:
            sections[s]["daily_done"] += 1
    return sections


@router.get("/category-stats")
def category_stats(current_user: User = require_admin(), db: Session = Depends(get_db)):
    from app.models.test import TestResultAnswer
    from app.models.question import Question
    from sqlalchemy import func
    rows = (
        db.query(Question.category_id, func.avg(
            (TestResultAnswer.is_correct.cast(int)) * 100
        ).label("avg_score"))
        .join(TestResultAnswer, Question.id == TestResultAnswer.question_id)
        .group_by(Question.category_id)
        .all()
    )
    return {r[0]: round(r[1], 1) for r in rows}


@router.get("/employee-activity")
def employee_activity(days: int = 30, current_user: User = require_admin_or_master(), db: Session = Depends(get_db)):
    since = date.today() - timedelta(days=days)
    results = db.query(TestResult).filter(TestResult.date_taken >= since).all()
    daily = {}
    for r in results:
        d = str(r.date_taken.date())
        daily[d] = daily.get(d, 0) + 1
    return [{"date": d, "count": c} for d, c in sorted(daily.items())]


@router.get("/test-results-workhelper")
def workhelper_test_results(current_user: User = require_admin(), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.profession != None, User.is_active == True).all()
    prof_map = {}
    for u in users:
        if u.profession not in prof_map:
            prof_map[u.profession] = {"total": 0, "passed": 0, "failed": 0}
        results = db.query(TestResult).filter(TestResult.user_id == u.id, TestResult.app_source == "workhelper").all()
        for r in results:
            prof_map[u.profession]["total"] += 1
            if r.passed:
                prof_map[u.profession]["passed"] += 1
            else:
                prof_map[u.profession]["failed"] += 1
    return [
        {"profession": k, **v, "pass_rate": round(v["passed"] / v["total"] * 100) if v["total"] > 0 else 0}
        for k, v in prof_map.items()
    ]
