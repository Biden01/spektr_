from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.alert_rule import AlertRule
from app.models.user import User
from app.schemas.alert_rule import AlertRuleCreate, AlertRuleUpdate, AlertRuleResponse
from app.core.permissions import require_admin

router = APIRouter(prefix="/alert-rules", tags=["alert-rules"])


@router.get("", response_model=List[AlertRuleResponse])
def list_rules(current_user: User = require_admin(), db: Session = Depends(get_db)):
    return db.query(AlertRule).order_by(AlertRule.id).all()


@router.post("", response_model=AlertRuleResponse)
def create_rule(data: AlertRuleCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    rule = AlertRule(**data.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.put("/{rule_id}", response_model=AlertRuleResponse)
def update_rule(rule_id: int, data: AlertRuleUpdate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    rule = db.query(AlertRule).filter(AlertRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(rule, k, v)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}")
def delete_rule(rule_id: int, current_user: User = require_admin(), db: Session = Depends(get_db)):
    rule = db.query(AlertRule).filter(AlertRule.id == rule_id).first()
    if rule:
        db.delete(rule)
        db.commit()
    return {"message": "Deleted"}
