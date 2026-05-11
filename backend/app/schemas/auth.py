from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    identifier: str
    password: str


class OtpRequestSchema(BaseModel):
    phone: str


class OtpVerifySchema(BaseModel):
    phone: str
    code: str


class RegisterRequest(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    password: str
    position: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
