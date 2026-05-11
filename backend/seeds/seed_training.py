from sqlalchemy.orm import Session
from app.models.training import TrainingMaterial

TRAINING = [
    {"title": "Безопасность на производстве", "type": "course", "duration_label": "4 часа", "total_lessons": 8, "thumbnail_url": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400"},
    {"title": "Основы работы на станках", "type": "course", "duration_label": "6 часов", "total_lessons": 12, "thumbnail_url": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400"},
    {"title": "Первая помощь", "type": "video", "duration_label": "45 мин", "thumbnail_url": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400"},
    {"title": "Качество продукции", "type": "article", "duration_label": "15 мин", "thumbnail_url": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400"},
]


def seed(db: Session):
    if db.query(TrainingMaterial).count() > 0:
        print("  Training: already exist, skipping")
        return
    for data in TRAINING:
        db.add(TrainingMaterial(**data))
    db.commit()
    print(f"  Training: {len(TRAINING)} seeded")
