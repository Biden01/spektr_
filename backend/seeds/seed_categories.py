from sqlalchemy.orm import Session
from app.models.category import Category


CATEGORIES = [
    {"id": "specifics", "name": "Специфика производства", "short": "Специфика", "color": "#1B4B7A", "bg_color": "#EEF3F8"},
    {"id": "medical", "name": "Медицинская подготовка", "short": "Медицина", "color": "#1F7A3D", "bg_color": "#EAF5EE"},
    {"id": "fire", "name": "Пожарная безопасность", "short": "Пожарная", "color": "#B8242D", "bg_color": "#FBECEC"},
    {"id": "labour", "name": "Охрана труда и ТБ", "short": "ТБ и ОТ", "color": "#C77A0F", "bg_color": "#FDF4E7"},
    {"id": "electro", "name": "Электробезопасность", "short": "Электро", "color": "#2F3B4D", "bg_color": "#EEF1F6"},
]


def seed(db: Session):
    for data in CATEGORIES:
        if not db.query(Category).filter(Category.id == data["id"]).first():
            db.add(Category(**data))
    db.commit()
    print(f"  Categories: {len(CATEGORIES)} seeded")
