from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.protocol import Protocol, ProtocolRule
from app.models.user import User
from app.schemas.protocol import ProtocolCreate, ProtocolUpdate, ProtocolResponse
from app.core.dependencies import get_current_user
from app.core.permissions import require_admin

router = APIRouter(prefix="/protocols", tags=["protocols"])


@router.get("", response_model=List[ProtocolResponse])
def list_protocols(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Protocol).filter(Protocol.is_active == True).all()


@router.post("", response_model=ProtocolResponse)
def create_protocol(req: ProtocolCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    rules = req.rules
    data = req.model_dump(exclude={"rules"})
    protocol = Protocol(**data)
    db.add(protocol)
    db.flush()
    for i, rule in enumerate(rules):
        db.add(ProtocolRule(protocol_id=protocol.id, order_num=i, rule_text=rule))
    db.commit()
    db.refresh(protocol)
    return protocol


@router.get("/{protocol_id}", response_model=ProtocolResponse)
def get_protocol(protocol_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    protocol = db.query(Protocol).filter(Protocol.id == protocol_id, Protocol.is_active == True).first()
    if not protocol:
        raise HTTPException(status_code=404, detail="Not found")
    return protocol


@router.put("/{protocol_id}", response_model=ProtocolResponse)
def update_protocol(protocol_id: str, req: ProtocolUpdate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    protocol = db.query(Protocol).filter(Protocol.id == protocol_id).first()
    if not protocol:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(protocol, field, value)
    db.commit()
    db.refresh(protocol)
    return protocol


@router.delete("/{protocol_id}")
def delete_protocol(protocol_id: str, current_user: User = require_admin(), db: Session = Depends(get_db)):
    protocol = db.query(Protocol).filter(Protocol.id == protocol_id).first()
    if protocol:
        protocol.is_active = False
        db.commit()
    return {"message": "Deleted"}
