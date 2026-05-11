from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict
from app.database import get_db
from app.models.setting import SystemSetting
from app.models.user import User
from app.core.permissions import require_admin

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def get_settings(current_user: User = require_admin(), db: Session = Depends(get_db)):
    settings = db.query(SystemSetting).all()
    return {s.key: s.value for s in settings}


@router.put("")
def update_settings(data: Dict[str, str], current_user: User = require_admin(), db: Session = Depends(get_db)):
    for key, value in data.items():
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting:
            setting.value = value
            setting.updated_by = current_user.id
        else:
            db.add(SystemSetting(key=key, value=value, updated_by=current_user.id))
    db.commit()
    return {"message": "Updated"}


@router.get("/{key}")
def get_setting(key: str, current_user: User = require_admin(), db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return {"key": setting.key, "value": setting.value}


@router.put("/{key}")
def update_setting(key: str, data: dict, current_user: User = require_admin(), db: Session = Depends(get_db)):
    value = data.get("value", "")
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if setting:
        setting.value = value
        setting.updated_by = current_user.id
    else:
        db.add(SystemSetting(key=key, value=value, updated_by=current_user.id))
    db.commit()
    return {"message": "Updated"}
