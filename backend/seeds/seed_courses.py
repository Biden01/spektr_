from sqlalchemy.orm import Session
from datetime import date
from app.models.course import Course, CourseProgramItem

COURSES = [
    {"id": "electro", "title": "Электробезопасность для электротехнического персонала", "direction": "Электробезопасность", "format": "mixed", "duration_hours": 40, "price_label": "85 000 ₸", "next_start_date": date(2026, 5, 15), "instructor": "Кудайберген Н.А., главный инженер", "cover_emoji": "⚡", "program": ["Группы допуска I–V", "Технические мероприятия", "Работы на действующих установках", "Оказание первой помощи", "Аттестация и удостоверение"]},
    {"id": "labour", "title": "Охрана труда для руководителей и специалистов", "direction": "Охрана труда", "format": "online", "duration_hours": 40, "price_label": "60 000 ₸", "next_start_date": date(2026, 5, 20), "instructor": "Сулейменова А.К., специалист ОТ", "cover_emoji": "🛡", "program": ["Трудовое законодательство РК", "Обязанности работодателя", "Расследование несчастных случаев", "СОУТ", "Удостоверение государственного образца"]},
    {"id": "fire", "title": "Пожарно-технический минимум для ИТР", "direction": "Пожарная безопасность", "format": "offline", "duration_hours": 20, "price_label": "45 000 ₸", "next_start_date": date(2026, 5, 12), "instructor": "Жумабаев Б.С., бывший начальник ПЧ", "cover_emoji": "🔥", "program": ["Противопожарный режим", "Системы противопожарной защиты", "Действия при пожаре", "Эвакуация", "Зачёт"]},
    {"id": "height", "title": "Работы на высоте (1–3 группы)", "direction": "Безопасный труд", "format": "mixed", "duration_hours": 24, "price_label": "55 000 ₸", "next_start_date": date(2026, 5, 18), "instructor": "Адильбеков Р.М., инструктор-практик", "cover_emoji": "🗼", "program": ["Системы обеспечения безопасности", "Анкерные точки", "Спасение пострадавшего на высоте", "Практика на полигоне"]},
    {"id": "crane", "title": "Стропальщик и крановщик: подготовка", "direction": "Грузоподъёмные работы", "format": "offline", "duration_hours": 120, "price_label": "120 000 ₸", "next_start_date": date(2026, 6, 1), "instructor": "Корпоративный центр обучения", "cover_emoji": "🏗", "program": ["Устройство подъёмных механизмов", "Стропы и оснастка", "Сигналы крановщику", "Стажировка", "Экзамен и удостоверение"]},
    {"id": "first-aid", "title": "Первая помощь пострадавшим на производстве", "direction": "Медицина", "format": "offline", "duration_hours": 16, "price_label": "30 000 ₸", "next_start_date": date(2026, 5, 8), "instructor": "Бекбосынова Г.Т., врач-инструктор", "cover_emoji": "⛑", "program": ["СЛР", "Остановка кровотечения", "Помощь при травмах", "Помощь при отравлениях", "Практика на манекенах"]},
]


def seed(db: Session):
    count = 0
    for data in COURSES:
        if db.query(Course).filter(Course.id == data["id"]).first():
            continue
        program = data.pop("program")
        course = Course(**data)
        db.add(course)
        db.flush()
        for i, item in enumerate(program):
            db.add(CourseProgramItem(course_id=course.id, order_num=i, item_text=item))
        count += 1
    db.commit()
    print(f"  Courses: {count} seeded")
