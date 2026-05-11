from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.database import get_db
from app.models.mood import MoodEntry
from app.models.user import User
from app.schemas.mood import MoodCreate, MoodResponse, MoodHistoryItem, MoodTodayResponse, MoodAnalyticsResponse, DepartmentMoodResponse
from app.core.dependencies import get_current_user
from app.core.permissions import require_admin
from sqlalchemy import func

router = APIRouter(prefix="/mood", tags=["mood"])


@router.post("", response_model=MoodResponse)
def submit_mood(req: MoodCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.mood < 1 or req.mood > 5:
        raise HTTPException(status_code=400, detail="Mood must be 1-5")
    mood_date = req.date or date.today()
    existing = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        MoodEntry.date == mood_date,
    ).first()
    if existing:
        existing.mood = req.mood
        db.commit()
        db.refresh(existing)
        return existing
    entry = MoodEntry(user_id=current_user.id, date=mood_date, mood=req.mood)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/today", response_model=MoodTodayResponse)
def mood_today(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    entry = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        MoodEntry.date == today,
    ).first()
    return MoodTodayResponse(
        submitted=entry is not None,
        mood=entry.mood if entry else None,
        date=str(today),
    )


@router.get("/history", response_model=List[MoodHistoryItem])
def mood_history(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    since = date.today() - timedelta(days=days)
    entries = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id, MoodEntry.date >= since)
        .order_by(MoodEntry.date.desc())
        .all()
    )
    return entries


@router.get("/analytics", response_model=MoodAnalyticsResponse)
def mood_analytics(days: int = 30, current_user: User = require_admin(), db: Session = Depends(get_db)):
    since = date.today() - timedelta(days=days)
    entries = db.query(MoodEntry).filter(MoodEntry.date >= since).all()
    total = len(entries)
    if total == 0:
        return MoodAnalyticsResponse(average=0, distribution=[], trend=[], total_entries=0)

    avg = sum(e.mood for e in entries) / total
    dist = {}
    for e in entries:
        dist[e.mood] = dist.get(e.mood, 0) + 1
    distribution = [{"mood": k, "count": v} for k, v in sorted(dist.items())]

    trend_map = {}
    for e in entries:
        day = str(e.date)
        if day not in trend_map:
            trend_map[day] = []
        trend_map[day].append(e.mood)
    trend = [{"date": d, "average": round(sum(vs) / len(vs), 2)} for d, vs in sorted(trend_map.items())]

    return MoodAnalyticsResponse(average=round(avg, 2), distribution=distribution, trend=trend, total_entries=total)


@router.get("/analytics/departments", response_model=List[DepartmentMoodResponse])
def dept_mood(days: int = 7, current_user: User = require_admin(), db: Session = Depends(get_db)):
    since = date.today() - timedelta(days=days)
    entries = db.query(MoodEntry).filter(MoodEntry.date >= since).all()
    dept_map = {}
    for entry in entries:
        user = db.query(User).filter(User.id == entry.user_id).first()
        dept = user.section or "Без участка" if user else "Неизвестно"
        if dept not in dept_map:
            dept_map[dept] = []
        dept_map[dept].append(entry.mood)
    return [
        DepartmentMoodResponse(department=dept, average=round(sum(moods) / len(moods), 2), count=len(moods))
        for dept, moods in dept_map.items()
    ]
