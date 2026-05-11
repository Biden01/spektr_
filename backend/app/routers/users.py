from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.user import User, UserMedicalInfo, MedicalClearance, UserWorkStats, Achievement
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserShort, UserMedicalInfoSchema, UserWorkStatsSchema, BulkNotifyRequest, AchievementSchema
from app.core.dependencies import get_current_user
from app.core.permissions import require_admin, require_admin_or_master
from app.core.security import hash_password
from app.models.notification import Notification

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[UserShort])
def list_users(
    search: Optional[str] = None,
    section: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    app_source: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    current_user: User = require_admin_or_master(),
    db: Session = Depends(get_db),
):
    q = db.query(User).filter(User.is_active == True)
    if current_user.role == "master":
        q = q.filter(User.section == current_user.section)
    if search:
        q = q.filter(User.full_name.ilike(f"%{search}%"))
    if section:
        q = q.filter(User.section == section)
    if role:
        q = q.filter(User.role == role)
    if status:
        q = q.filter(User.status == status)
    if app_source:
        q = q.filter(User.app_source.in_([app_source, "both"]))
    return q.offset(skip).limit(limit).all()


@router.get("/sections", response_model=List[str])
def get_sections(db: Session = Depends(get_db), current_user: User = require_admin_or_master()):
    rows = db.query(User.section).filter(User.section != None, User.is_active == True).distinct().all()
    return [r[0] for r in rows]


@router.get("/me/subordinates", response_model=List[UserShort])
def get_subordinates(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "master":
        raise HTTPException(status_code=403, detail="Only masters have subordinates")
    db.refresh(current_user)
    return current_user.subordinates


@router.post("", response_model=UserResponse)
def create_user(req: UserCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    slug = req.tab_number or req.email or req.full_name.lower().replace(" ", "_")
    user = User(
        slug=slug,
        full_name=req.full_name,
        initials=req.initials,
        tab_number=req.tab_number,
        phone=req.phone,
        email=req.email,
        hashed_password=hash_password(req.password) if req.password else None,
        role=req.role,
        app_source=req.app_source,
        position=req.position,
        section=req.section,
        profession=req.profession,
        access_group=req.access_group,
        annual_due_days=req.annual_due_days,
        medical_due_days=req.medical_due_days,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ("admin", "master") and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, req: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, current_user: User = require_admin(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}


@router.get("/{user_id}/achievements", response_model=List[AchievementSchema])
def get_achievements(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Achievement).filter(Achievement.user_id == user_id).all()


@router.get("/{user_id}/medical", response_model=UserMedicalInfoSchema)
def get_medical(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    info = user.medical_info or UserMedicalInfo()
    clearances = user.medical_clearances
    return UserMedicalInfoSchema(
        blood_type=info.blood_type if user.medical_info else None,
        average_blood_pressure=info.average_blood_pressure if user.medical_info else None,
        medical_clearances=[
            {"id": c.id, "name": c.name, "expiry_date": c.expiry_date, "status": c.status}
            for c in clearances
        ],
    )


@router.put("/{user_id}/medical")
def update_medical(user_id: int, req: UserMedicalInfoSchema, current_user: User = require_admin(), db: Session = Depends(get_db)):
    info = db.query(UserMedicalInfo).filter(UserMedicalInfo.user_id == user_id).first()
    if not info:
        info = UserMedicalInfo(user_id=user_id)
        db.add(info)
    info.blood_type = req.blood_type
    info.average_blood_pressure = req.average_blood_pressure
    db.commit()
    return {"message": "Updated"}


@router.get("/{user_id}/work-stats", response_model=UserWorkStatsSchema)
def get_work_stats(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    stats = db.query(UserWorkStats).filter(UserWorkStats.user_id == user_id).first()
    if not stats:
        return UserWorkStatsSchema()
    return stats


@router.put("/{user_id}/work-stats")
def update_work_stats(user_id: int, req: UserWorkStatsSchema, current_user: User = require_admin(), db: Session = Depends(get_db)):
    stats = db.query(UserWorkStats).filter(UserWorkStats.user_id == user_id).first()
    if not stats:
        stats = UserWorkStats(user_id=user_id)
        db.add(stats)
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(stats, field, value)
    db.commit()
    return {"message": "Updated"}


@router.post("/bulk-notify")
def bulk_notify(req: BulkNotifyRequest, current_user: User = require_admin(), db: Session = Depends(get_db)):
    for uid in req.user_ids:
        n = Notification(user_id=uid, title=req.title, message=req.message)
        db.add(n)
    db.commit()
    return {"message": f"Sent to {len(req.user_ids)} users"}
