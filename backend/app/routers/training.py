from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.training import TrainingMaterial, TrainingProgress
from app.models.user import User
from app.schemas.training import TrainingCreate, TrainingUpdate, TrainingResponse, UpdateTrainingProgressRequest
from app.core.dependencies import get_current_user
from app.core.permissions import require_admin

router = APIRouter(prefix="/training", tags=["training"])


@router.get("", response_model=List[TrainingResponse])
def list_training(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    materials = db.query(TrainingMaterial).filter(TrainingMaterial.is_active == True).all()
    progress_map = {
        p.material_id: p
        for p in db.query(TrainingProgress).filter(TrainingProgress.user_id == current_user.id).all()
    }
    result = []
    for m in materials:
        resp = TrainingResponse.model_validate(m)
        if m.id in progress_map:
            p = progress_map[m.id]
            resp.progress_pct = p.progress_pct
            resp.completed_lessons = p.completed_lessons
        else:
            resp.progress_pct = 0
            resp.completed_lessons = 0
        result.append(resp)
    return result


@router.get("/{material_id}", response_model=TrainingResponse)
def get_training(material_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    material = db.query(TrainingMaterial).filter(TrainingMaterial.id == material_id, TrainingMaterial.is_active == True).first()
    if not material:
        raise HTTPException(status_code=404, detail="Not found")
    progress = db.query(TrainingProgress).filter(
        TrainingProgress.user_id == current_user.id,
        TrainingProgress.material_id == material_id,
    ).first()
    resp = TrainingResponse.model_validate(material)
    resp.progress_pct = progress.progress_pct if progress else 0
    resp.completed_lessons = progress.completed_lessons if progress else 0
    return resp


@router.post("", response_model=TrainingResponse)
def create_training(req: TrainingCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    m = TrainingMaterial(**req.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.put("/{material_id}", response_model=TrainingResponse)
def update_training(material_id: int, req: TrainingUpdate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    m = db.query(TrainingMaterial).filter(TrainingMaterial.id == material_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(m, field, value)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/{material_id}")
def delete_training(material_id: int, current_user: User = require_admin(), db: Session = Depends(get_db)):
    m = db.query(TrainingMaterial).filter(TrainingMaterial.id == material_id).first()
    if m:
        m.is_active = False
        db.commit()
    return {"message": "Deleted"}


@router.put("/{material_id}/progress")
def update_progress(material_id: int, req: UpdateTrainingProgressRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress = db.query(TrainingProgress).filter(
        TrainingProgress.user_id == current_user.id,
        TrainingProgress.material_id == material_id,
    ).first()
    if not progress:
        progress = TrainingProgress(user_id=current_user.id, material_id=material_id)
        db.add(progress)
    progress.completed_lessons = req.completed_lessons
    progress.progress_pct = req.progress_pct
    db.commit()
    return {"message": "Updated"}
