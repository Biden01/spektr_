import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.auth import OtpCode, RefreshToken
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.config import settings


def authenticate_user(db: Session, identifier: str, password: str) -> User | None:
    user = db.query(User).filter(
        ((User.tab_number == identifier) | (User.email == identifier)) & (User.is_active == True)
    ).first()
    if not user or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def create_otp(db: Session, phone: str) -> str:
    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    otp = OtpCode(phone=phone, code_hash=hash_password(code), expires_at=expires_at)
    db.add(otp)
    db.commit()
    return code


def verify_otp(db: Session, phone: str, code: str) -> bool:
    now = datetime.now(timezone.utc)
    otp = (
        db.query(OtpCode)
        .filter(OtpCode.phone == phone, OtpCode.used == False, OtpCode.expires_at > now)
        .order_by(OtpCode.created_at.desc())
        .first()
    )
    if not otp:
        return False
    if not verify_password(code, otp.code_hash):
        return False
    otp.used = True
    db.commit()
    return True


def get_or_create_phone_user(db: Session, phone: str) -> User:
    user = db.query(User).filter(User.phone == phone, User.is_active == True).first()
    if not user:
        slug = "wh_" + phone.replace("+", "").replace(" ", "").replace("(", "").replace(")", "").replace("-", "")
        user = User(slug=slug, full_name=phone, phone=phone, role="employee", app_source="workhelper")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def create_token_pair(db: Session, user: User) -> tuple[str, str]:
    access = create_access_token(user.id, user.role)
    refresh = create_refresh_token(user.id)
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    rt = RefreshToken(user_id=user.id, token_hash=hash_password(refresh), expires_at=expire)
    db.add(rt)
    db.commit()
    return access, refresh


def refresh_access_token(db: Session, refresh_token: str) -> str | None:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return None
    now = datetime.now(timezone.utc)
    tokens = db.query(RefreshToken).filter(
        RefreshToken.user_id == int(payload["sub"]),
        RefreshToken.revoked == False,
        RefreshToken.expires_at > now,
    ).all()
    for rt in tokens:
        if verify_password(refresh_token, rt.token_hash):
            user = db.query(User).filter(User.id == rt.user_id).first()
            if user:
                return create_access_token(user.id, user.role)
    return None


def revoke_refresh_tokens(db: Session, user_id: int):
    db.query(RefreshToken).filter(RefreshToken.user_id == user_id).update({"revoked": True})
    db.commit()
