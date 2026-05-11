from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationCreate, BulkNotificationCreate, NotificationResponse, UnreadCountResponse
from app.core.dependencies import get_current_user
from app.core.permissions import require_admin

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationResponse])
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
def unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False,
    ).count()
    return UnreadCountResponse(count=count)


@router.post("", response_model=NotificationResponse)
def create_notification(req: NotificationCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    n = Notification(user_id=req.user_id, title=req.title, message=req.message)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


@router.post("/bulk")
def bulk_notify(req: BulkNotificationCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    for uid in req.user_ids:
        n = Notification(user_id=uid, title=req.title, message=req.message)
        db.add(n)
    db.commit()
    return {"message": f"Sent to {len(req.user_ids)} users"}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Not found")
    n.read = True
    n.read_at = datetime.utcnow()
    db.commit()
    db.refresh(n)
    return n


@router.post("/read-all")
def read_all(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False,
    ).update({"read": True, "read_at": datetime.utcnow()})
    db.commit()
    return {"message": "All marked as read"}


@router.delete("/{notification_id}")
def delete_notification(notification_id: int, current_user: User = require_admin(), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if n:
        db.delete(n)
        db.commit()
    return {"message": "Deleted"}
