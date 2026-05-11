from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.models.document import Document, DocumentRead
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentStats
from app.core.dependencies import get_current_user, get_current_user_optional
from app.core.permissions import require_admin

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=List[DocumentResponse])
def list_documents(
    category: Optional[str] = None,
    app_source: Optional[str] = None,
    profession: Optional[str] = None,
    section: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    q = db.query(Document).filter(Document.is_active == True)
    if app_source:
        q = q.filter(Document.app_source.in_([app_source, "both"]))
    if category:
        q = q.filter(Document.category == category)
    if profession:
        q = q.filter(Document.profession.in_([profession, "Все"]))
    if section:
        q = q.filter(Document.section == section)
    docs = q.offset(skip).limit(limit).all()

    if current_user:
        read_ids = {r.document_id for r in db.query(DocumentRead).filter(DocumentRead.user_id == current_user.id).all()}
        for doc in docs:
            doc.read = doc.id in read_ids
    return docs


@router.get("/stats", response_model=DocumentStats)
def document_stats(current_user: User = require_admin(), db: Session = Depends(get_db)):
    total = db.query(Document).filter(Document.is_active == True).count()
    from sqlalchemy import func
    most_read = (
        db.query(Document.title, func.count(DocumentRead.id).label("reads"))
        .join(DocumentRead, Document.id == DocumentRead.document_id)
        .group_by(Document.id)
        .order_by(func.count(DocumentRead.id).desc())
        .limit(5)
        .all()
    )
    return DocumentStats(total=total, most_read=[{"title": r[0], "reads": r[1]} for r in most_read])


@router.post("", response_model=DocumentResponse)
def create_document(req: DocumentCreate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    doc = Document(**req.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.is_active == True).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    if current_user:
        read = db.query(DocumentRead).filter(
            DocumentRead.user_id == current_user.id,
            DocumentRead.document_id == document_id,
        ).first()
        doc.read = read is not None
    return doc


@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(document_id: int, req: DocumentUpdate, current_user: User = require_admin(), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in req.model_dump(exclude_none=True).items():
        setattr(doc, field, value)
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{document_id}")
def delete_document(document_id: int, current_user: User = require_admin(), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if doc:
        doc.is_active = False
        db.commit()
    return {"message": "Deleted"}


@router.post("/{document_id}/mark-read")
def mark_read(document_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(DocumentRead).filter(
        DocumentRead.user_id == current_user.id,
        DocumentRead.document_id == document_id,
    ).first()
    if not existing:
        dr = DocumentRead(user_id=current_user.id, document_id=document_id)
        db.add(dr)
        db.commit()
    return {"message": "Marked as read"}
