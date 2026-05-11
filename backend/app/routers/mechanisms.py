from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.mechanism import Mechanism, MechanismStep
from app.models.user import User
from app.schemas.mechanism import MechanismCreate, MechanismUpdate, MechanismResponse
from app.core.dependencies import get_current_user
from app.core.permissions import require_admin

router = APIRouter(prefix="/mechanisms", tags=["mechanisms"])


@router.get("", response_model=List[MechanismResponse])
def list_mechanisms(
    profession: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Mechanism).filter(Mechanism.is_active == True)
    if profession:
        q = q.filter(Mechanism.profession == profession)
    return q.all()


@router.post("", response_model=MechanismResponse)
def create_mechanism(req: MechanismCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    steps = req.steps
    data = req.model_dump(exclude={"steps"})
    mechanism = Mechanism(**data)
    db.add(mechanism)
    db.flush()
    for i, step in enumerate(steps):
        db.add(MechanismStep(mechanism_id=mechanism.id, order_num=i, step_text=step))
    db.commit()
    db.refresh(mechanism)
    return mechanism


@router.get("/{mechanism_id}", response_model=MechanismResponse)
def get_mechanism(mechanism_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mechanism = db.query(Mechanism).filter(Mechanism.id == mechanism_id, Mechanism.is_active == True).first()
    if not mechanism:
        raise HTTPException(status_code=404, detail="Not found")
    return mechanism


@router.put("/{mechanism_id}", response_model=MechanismResponse)
def update_mechanism(mechanism_id: str, req: MechanismUpdate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    mechanism = db.query(Mechanism).filter(Mechanism.id == mechanism_id).first()
    if not mechanism:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(mechanism, field, value)
    db.commit()
    db.refresh(mechanism)
    return mechanism


@router.delete("/{mechanism_id}")
def delete_mechanism(mechanism_id: str, current_user: User = require_admin(), db: Session = Depends(get_db)):
    mechanism = db.query(Mechanism).filter(Mechanism.id == mechanism_id).first()
    if mechanism:
        mechanism.is_active = False
        db.commit()
    return {"message": "Deleted"}
