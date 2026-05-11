import uuid
import os
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_DOCUMENT_TYPES = {"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_DOCUMENT_SIZE = 50 * 1024 * 1024
MAX_IMAGE_SIZE = 5 * 1024 * 1024


async def save_upload(file: UploadFile, subdir: str, allowed_types: set, max_size: int) -> str:
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type {file.content_type} not allowed")

    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="File too large")

    ext = os.path.splitext(file.filename or "file")[1] or ".bin"
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, subdir, filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)

    with open(path, "wb") as f:
        f.write(content)

    return f"/uploads/{subdir}/{filename}"


async def save_document(file: UploadFile) -> str:
    return await save_upload(file, "documents", ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE)


async def save_image(file: UploadFile) -> str:
    return await save_upload(file, "images", ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)


def delete_file(filename: str):
    path = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(path):
        os.remove(path)
