from sqlalchemy.orm import Session
from datetime import date
from app.models.mood import MoodEntry
from app.models.user import User

MOOD_HISTORY = [
    {"date": date(2026, 2, 19), "mood": 5}, {"date": date(2026, 2, 18), "mood": 4},
    {"date": date(2026, 2, 17), "mood": 5}, {"date": date(2026, 2, 16), "mood": 3},
    {"date": date(2026, 2, 15), "mood": 4}, {"date": date(2026, 2, 14), "mood": 5},
    {"date": date(2026, 2, 13), "mood": 4}, {"date": date(2026, 2, 12), "mood": 4},
    {"date": date(2026, 2, 11), "mood": 5}, {"date": date(2026, 2, 10), "mood": 3},
    {"date": date(2026, 2, 9), "mood": 4},  {"date": date(2026, 2, 8), "mood": 2},
    {"date": date(2026, 2, 7), "mood": 4},  {"date": date(2026, 2, 6), "mood": 5},
    {"date": date(2026, 2, 5), "mood": 4},
]


def seed(db: Session):
    user = db.query(User).filter(User.slug == "wh_ivanov").first()
    if not user:
        print("  Mood: wh_ivanov user not found, skipping")
        return
    existing = db.query(MoodEntry).filter(MoodEntry.user_id == user.id).count()
    if existing > 0:
        print(f"  Mood: already {existing} entries, skipping")
        return
    for data in MOOD_HISTORY:
        db.add(MoodEntry(user_id=user.id, **data))
    db.commit()
    print(f"  Mood: {len(MOOD_HISTORY)} entries seeded")
