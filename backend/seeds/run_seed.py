import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
import app.models  # noqa — register all models

from seeds import (
    seed_categories, seed_users, seed_questions, seed_lessons,
    seed_documents, seed_courses, seed_protocols, seed_mechanisms,
    seed_mood, seed_training, seed_notifications, seed_settings,
)

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    print("🌱 Seeding database...")
    seed_categories.seed(db)
    seed_users.seed(db)
    seed_questions.seed(db)
    seed_lessons.seed(db)
    seed_documents.seed(db)
    seed_courses.seed(db)
    seed_protocols.seed(db)
    seed_mechanisms.seed(db)
    seed_mood.seed(db)
    seed_training.seed(db)
    seed_notifications.seed(db)
    seed_settings.seed(db)
    print("✅ Done!")
finally:
    db.close()
