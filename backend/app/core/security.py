from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib
import hmac
import secrets
from jose import jwt, JWTError
from app.config import settings


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 260000)
    return f"pbkdf2:{salt}:{hashed.hex()}"


def verify_password(plain: str, hashed: str) -> bool:
    if not hashed or not hashed.startswith("pbkdf2:"):
        return False
    parts = hashed.split(":", 2)
    if len(parts) != 3:
        return False
    _, salt, stored_hash = parts
    computed = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 260000)
    return hmac.compare_digest(computed.hex(), stored_hash)


def create_access_token(user_id: int, role: str, app: str = "spektr") -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "role": role, "app": app, "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def create_refresh_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(user_id), "type": "refresh", "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
