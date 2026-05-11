from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.models.user import User
from app.services.file_service import save_document, save_image, delete_file
from app.core.dependencies import get_current_user
from app.core.permissions import require_admin

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/document")
async def upload_document(file: UploadFile = File(...), current_user: User = require_admin()):
    url = await save_document(file)
    return {"url": url, "filename": file.filename}


@router.post("/image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    url = await save_image(file)
    return {"url": url, "filename": file.filename}


@router.delete("/{filename:path}")
def remove_file(filename: str, current_user: User = require_admin()):
    delete_file(filename)
    return {"message": "Deleted"}
