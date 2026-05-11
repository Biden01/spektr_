from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    LoginRequest, OtpRequestSchema, OtpVerifySchema, RegisterRequest,
    RefreshRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest,
)
from app.schemas.user import UserResponse
from app.services import auth_service
from app.core.dependencies import get_current_user
from app.core.security import hash_password
from app.models.user import User
from app.config import settings
from app.services.event_service import log as log_event

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=dict)
@limiter.limit("10/minute")
def login(request: Request, req: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, req.identifier, req.password)
    if not user:
        log_event(db, "login_failed", f"Failed login attempt for {req.identifier}", tone="warn", ip=request.client.host if request.client else None)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access, refresh = auth_service.create_token_pair(db, user)
    log_event(db, "login", f"User {user.full_name} logged in", user_id=user.id, tone="info", ip=request.client.host if request.client else None)
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer", "user": {
        "id": user.id, "full_name": user.full_name, "role": user.role, "slug": user.slug,
        "section": user.section, "position": user.position, "photo_url": user.photo_url,
        "tab_number": user.tab_number, "email": user.email, "phone": user.phone,
        "state": user.state, "daily_done_today": user.daily_done_today,
        "annual_due_days": user.annual_due_days, "medical_due_days": user.medical_due_days,
    }}


@router.post("/otp/request")
@limiter.limit("5/minute")
def request_otp(request: Request, req: OtpRequestSchema, db: Session = Depends(get_db)):
    code = auth_service.create_otp(db, req.phone)
    response = {"message": "OTP sent"}
    if settings.DEBUG:
        response["debug_code"] = code
    return response


@router.post("/otp/verify", response_model=dict)
def verify_otp(req: OtpVerifySchema, db: Session = Depends(get_db)):
    if not auth_service.verify_otp(db, req.phone, req.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")
    user = auth_service.get_or_create_phone_user(db, req.phone)
    access, refresh = auth_service.create_token_pair(db, user)
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer", "user": {
        "id": user.id, "full_name": user.full_name, "role": user.role,
    }}


@router.post("/refresh")
def refresh_token(req: RefreshRequest, db: Session = Depends(get_db)):
    access = auth_service.refresh_access_token(db, req.refresh_token)
    if not access:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    return {"access_token": access, "token_type": "bearer"}


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_event(db, "logout", f"User {current_user.full_name} logged out", user_id=current_user.id, tone="info")
    auth_service.revoke_refresh_tokens(db, current_user.id)
    return {"message": "Logged out"}


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if req.email and db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    slug = f"student_{req.full_name.lower().replace(' ', '_')}"
    user = User(
        slug=slug,
        full_name=req.full_name,
        phone=req.phone,
        email=req.email,
        hashed_password=hash_password(req.password),
        role="student",
        app_source="spektr",
        position=req.position or "Слушатель",
        section="Учебный центр",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    access, refresh = auth_service.create_token_pair(db, user)
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return {"message": "If email exists, reset link sent"}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    return {"message": "Password reset"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password")
def change_password(
    req: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.core.security import verify_password, hash_password as hp
    current_pwd = req.get("current_password", "")
    new_pwd = req.get("new_password", "")
    if not verify_password(current_pwd, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Неверный текущий пароль")
    if len(new_pwd) < 4:
        raise HTTPException(status_code=400, detail="Минимум 4 символа")
    current_user.hashed_password = hp(new_pwd)
    db.commit()
    return {"message": "Пароль изменён"}
