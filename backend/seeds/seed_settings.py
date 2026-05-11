from sqlalchemy.orm import Session
from app.models.setting import SystemSetting

DEFAULTS = {
    "org_name": "ВТС — Учебный центр",
    "daily_pass_pct": "70",
    "annual_pass_pct": "80",
    "daily_question_count": "10",
    "annual_question_count": "50",
    "daily_time_limit_min": "10",
    "annual_time_limit_min": "60",
    "sms_provider": "debug",
}


def seed(db: Session):
    count = 0
    for key, value in DEFAULTS.items():
        if not db.query(SystemSetting).filter(SystemSetting.key == key).first():
            db.add(SystemSetting(key=key, value=value))
            count += 1
    db.commit()
    print(f"  Settings: {count} seeded")
