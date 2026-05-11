from sqlalchemy.orm import Session
from app.models.event import Event


def log(db: Session, type: str, text: str, user_id: int | None = None, tone: str = "info", app_source: str = "spektr", ip: str | None = None):
    event = Event(user_id=user_id, type=type, text=text, tone=tone, app_source=app_source, ip_address=ip)
    db.add(event)
    db.commit()
