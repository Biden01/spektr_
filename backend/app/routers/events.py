from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.event import Event
from app.models.user import User
from app.schemas.event import EventResponse
from app.core.permissions import require_admin

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=List[EventResponse])
def list_events(
    type: Optional[str] = None,
    user_id: Optional[int] = None,
    app_source: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    current_user: User = require_admin(),
    db: Session = Depends(get_db),
):
    q = db.query(Event)
    if type:
        q = q.filter(Event.type == type)
    if user_id:
        q = q.filter(Event.user_id == user_id)
    if app_source:
        q = q.filter(Event.app_source == app_source)
    return q.order_by(Event.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/recent", response_model=List[EventResponse])
def recent_events(n: int = 10, current_user: User = require_admin(), db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.created_at.desc()).limit(n).all()
