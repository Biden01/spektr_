from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.category import Category
from app.models.user import User
from app.core.permissions import require_admin

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.post("")
def create_category(data: dict, current_user: User = require_admin(), db: Session = Depends(get_db)):
    cat = Category(**data)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{cat_id}")
def update_category(cat_id: str, data: dict, current_user: User = require_admin(), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.items():
        setattr(cat, k, v)
    db.commit()
    return cat


@router.delete("/{cat_id}")
def delete_category(cat_id: str, current_user: User = require_admin(), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if cat:
        db.delete(cat)
        db.commit()
    return {"message": "Deleted"}
