from sqlalchemy.orm import Session
from datetime import date
from app.models.user import User, Achievement, UserMedicalInfo, MedicalClearance, UserWorkStats
from app.core.security import hash_password

SPEKTR_USERS = [
    {
        "slug": "ivanov", "full_name": "Иванов Иван Петрович", "initials": "ИП",
        "tab_number": "48213", "role": "employee", "position": "Электромонтёр 5 разряда",
        "section": "Участок № 3", "access_group": "IV", "phone": "+7 (777) 123-45-67",
        "email": "ivanov@vts.kz", "state": "all_ok", "daily_done_today": False,
        "annual_due_days": 87, "medical_due_days": 142, "app_source": "both",
        "achievements": [
            {"title": "Электробезопасность IV", "awarded_date": date(2026, 3, 15)},
            {"title": "Охрана труда", "awarded_date": date(2026, 2, 2)},
            {"title": "Пожарная безопасность", "awarded_date": date(2026, 1, 20)},
        ],
    },
    {
        "slug": "sidorov", "full_name": "Сидоров Алексей Викторович", "initials": "АС",
        "tab_number": "48156", "role": "employee", "position": "Слесарь-ремонтник 4 разряда",
        "section": "Участок № 1", "access_group": "III", "phone": "+7 (777) 234-56-78",
        "email": "sidorov@vts.kz", "state": "overdue", "daily_done_today": False,
        "annual_due_days": -3, "medical_due_days": 5, "app_source": "spektr",
        "achievements": [
            {"title": "Охрана труда", "awarded_date": date(2025, 4, 12)},
            {"title": "Пожарная безопасность", "awarded_date": date(2025, 3, 8)},
        ],
    },
    {
        "slug": "petrova", "full_name": "Петрова Мария Сергеевна", "initials": "МП",
        "tab_number": "47002", "role": "master", "position": "Мастер участка",
        "section": "Участок № 3", "access_group": "V", "phone": "+7 (777) 345-67-89",
        "email": "petrova@vts.kz", "state": "all_ok", "daily_done_today": True,
        "annual_due_days": 142, "medical_due_days": 89, "app_source": "spektr",
        "achievements": [],
    },
    {
        "slug": "kuznetsov", "full_name": "Кузнецов Дмитрий Анатольевич", "initials": "ДК",
        "tab_number": "A-001", "role": "admin", "position": "Администратор системы",
        "section": "Управление", "phone": "+7 (777) 456-78-90",
        "email": "admin@vts.kz", "state": "all_ok", "app_source": "spektr",
        "achievements": [],
    },
    {
        "slug": "akhmetov", "full_name": "Ахметов Канат", "initials": "КА",
        "tab_number": None, "role": "student", "position": "Слушатель",
        "section": "Учебный центр", "phone": "+7 (777) 567-89-01",
        "email": "akhmetov@external.kz", "state": "all_ok",
        "enrolled_course_id": "electro", "app_source": "spektr",
        "achievements": [],
    },
]

WORKHELPER_USERS = [
    {
        "slug": "wh_ivanov", "full_name": "Иванов Алексей Петрович",
        "position": "Оператор станков", "profession": "Станочник",
        "section": "Цех №3", "phone": "+7 (707) 123-45-67",
        "email": "ivanov@factory.kz", "role": "employee", "app_source": "workhelper",
        "photo_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    },
    {
        "slug": "wh_petrov", "full_name": "Петров Дмитрий Сергеевич",
        "position": "Мастер участка", "profession": "Инженер-технолог",
        "section": "Управление производством", "phone": "+7 (707) 987-65-43",
        "email": "petrov@factory.kz", "role": "admin", "app_source": "workhelper",
        "photo_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
        "hire_date": date(2018, 3, 15),
    },
    {
        "slug": "wh_petrova_e", "full_name": "Петрова Елена Сергеевна",
        "position": "Инженер по качеству", "profession": "Инженер",
        "section": "ОТК", "phone": "+7 (707) 111-22-33",
        "email": "petrova_e@factory.kz", "role": "employee", "app_source": "workhelper",
        "photo_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    },
    {
        "slug": "wh_smirnov", "full_name": "Смирнов Дмитрий Иванович",
        "position": "Фрезеровщик", "profession": "Фрезеровщик",
        "section": "Цех №2", "phone": "+7 (707) 222-33-44",
        "email": "smirnov@factory.kz", "role": "employee", "app_source": "workhelper",
        "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    },
    {
        "slug": "wh_kozlova", "full_name": "Козлова Анна Викторовна",
        "position": "Контролёр ОТК", "profession": "Контролёр",
        "section": "ОТК", "phone": "+7 (707) 333-44-55",
        "email": "kozlova@factory.kz", "role": "employee", "app_source": "workhelper",
        "photo_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    },
]

EXTRA_EMPLOYEES = [
    {"slug": f"emp_{i:03d}", "full_name": f"Сотрудник {i}", "tab_number": f"5{9000+i}",
     "role": "employee", "section": f"Участок № {(i % 3) + 1}", "position": "Электромонтёр",
     "state": "all_ok", "app_source": "spektr"}
    for i in range(4, 16)
]


def seed(db: Session):
    count = 0
    for data in SPEKTR_USERS:
        if db.query(User).filter(User.slug == data["slug"]).first():
            continue
        achievements = data.pop("achievements", [])
        user = User(
            **data,
            hashed_password=hash_password("demo1234"),
        )
        db.add(user)
        db.flush()
        for ach in achievements:
            db.add(Achievement(user_id=user.id, **ach))
        count += 1

    for data in WORKHELPER_USERS:
        if db.query(User).filter(User.slug == data["slug"]).first():
            continue
        user = User(**data, hashed_password=hash_password("demo1234"))
        db.add(user)
        db.flush()
        db.add(UserMedicalInfo(user_id=user.id, blood_type="A(II) Rh+", average_blood_pressure="120/80"))
        db.add(MedicalClearance(user_id=user.id, name="Медосмотр", expiry_date=date(2026, 6, 15), status="active"))
        db.add(MedicalClearance(user_id=user.id, name="Флюорография", expiry_date=date(2026, 12, 20), status="active"))
        db.add(UserWorkStats(user_id=user.id, vacation_days_taken=14, total_vacation_days=28))
        count += 1

    for data in EXTRA_EMPLOYEES:
        if db.query(User).filter(User.slug == data["slug"]).first():
            continue
        user = User(**data, hashed_password=hash_password("demo1234"))
        db.add(user)
        count += 1

    db.commit()

    petrova = db.query(User).filter(User.slug == "petrova").first()
    if petrova:
        slugs = ["ivanov", "sidorov", "emp_004", "emp_005", "emp_006"]
        for slug in slugs:
            sub = db.query(User).filter(User.slug == slug).first()
            if sub and sub not in petrova.subordinates:
                petrova.subordinates.append(sub)
        db.commit()

    print(f"  Users: {count} seeded")
