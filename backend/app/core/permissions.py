from fastapi import HTTPException, status, Depends
from app.models.user import User
from app.core.dependencies import get_current_user


def require_roles(*allowed_roles: str):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return Depends(dependency)


def require_admin():
    return require_roles("admin")


def require_admin_or_master():
    return require_roles("admin", "master")
