from sqlalchemy.orm import Session
from datetime import date
from app.models.lesson import Lesson

LESSONS = [
    {"category_id": "electro", "title": "Основы электробезопасности на производстве", "duration_label": "12:34", "duration_sec": 754, "views": 248, "status": "done", "publish_date": date(2026, 4, 12), "has_test": True, "description": "Базовые правила работы с электроустановками. Группы допуска, технические мероприятия, СИЗ."},
    {"category_id": "electro", "title": "Работы со снятием напряжения до 1000 В", "duration_label": "18:12", "duration_sec": 1092, "views": 156, "status": "done", "publish_date": date(2026, 4, 8), "has_test": True, "description": "Последовательность подготовки рабочего места. Демонстрация на стенде."},
    {"category_id": "fire", "title": "Первичные средства пожаротушения", "duration_label": "08:45", "duration_sec": 525, "views": 312, "status": "new", "publish_date": date(2026, 4, 20), "has_test": True, "description": "Виды огнетушителей, область применения, правила использования."},
    {"category_id": "fire", "title": "Эвакуация при пожаре", "duration_label": "14:00", "duration_sec": 840, "views": 187, "status": "new", "publish_date": date(2026, 4, 15), "has_test": False, "description": "Правила поведения, организация эвакуации, помощь маломобильным сотрудникам."},
    {"category_id": "medical", "title": "Сердечно-лёгочная реанимация", "duration_label": "22:18", "duration_sec": 1338, "views": 290, "status": "todo", "publish_date": date(2026, 4, 2), "has_test": True, "description": "Современный протокол СЛР. Практические рекомендации."},
    {"category_id": "medical", "title": "Помощь при травмах и переломах", "duration_label": "15:30", "duration_sec": 930, "views": 145, "status": "todo", "publish_date": date(2026, 3, 28), "has_test": True, "description": "Иммобилизация, остановка кровотечения, транспортировка."},
    {"category_id": "labour", "title": "СИЗ: правильное применение", "duration_label": "10:55", "duration_sec": 655, "views": 401, "status": "done", "publish_date": date(2026, 3, 18), "has_test": True, "description": "Обзор основных видов СИЗ для разных профессий."},
    {"category_id": "labour", "title": "Работы на высоте: техника безопасности", "duration_label": "20:00", "duration_sec": 1200, "views": 178, "status": "todo", "publish_date": date(2026, 3, 12), "has_test": True, "description": "Анкерные точки, страховочные системы, лестницы."},
    {"category_id": "specifics", "title": "Внутренние стандарты ВТС", "duration_label": "16:42", "duration_sec": 1002, "views": 95, "status": "new", "publish_date": date(2026, 4, 22), "has_test": False, "description": "Корпоративные правила, стандарты документооборота, отчётность."},
    {"category_id": "specifics", "title": "Наряд-допуск: оформление и работа", "duration_label": "13:08", "duration_sec": 788, "views": 124, "status": "todo", "publish_date": date(2026, 4, 10), "has_test": True, "description": "Порядок выдачи наряда-допуска. Типичные ошибки."},
    {"category_id": "electro", "title": "Шаговое напряжение и защита от него", "duration_label": "09:24", "duration_sec": 564, "views": 88, "status": "new", "publish_date": date(2026, 4, 21), "has_test": True, "description": "Как ходить в зоне замыкания. Демонстрация на полигоне."},
    {"category_id": "medical", "title": "Тепловой и солнечный удар: первая помощь", "duration_label": "07:50", "duration_sec": 470, "views": 203, "status": "done", "publish_date": date(2026, 4, 1), "has_test": False, "description": "Работа в условиях высокой температуры. Признаки, помощь, профилактика."},
]


def seed(db: Session):
    if db.query(Lesson).count() > 0:
        print("  Lessons: already exist, skipping")
        return
    for data in LESSONS:
        db.add(Lesson(**data))
    db.commit()
    print(f"  Lessons: {len(LESSONS)} seeded")
