from sqlalchemy.orm import Session
from datetime import date
from app.models.document import Document

SPEKTR_DOCS = [
    {"title": "Лицензия Министерства образования РК", "category": "license", "app_source": "spektr", "file_format": "PDF", "file_size_label": "1.2 МБ", "updated_at": date(2026, 1, 15)},
    {"title": "Сертификат ISO 27001", "category": "license", "app_source": "spektr", "file_format": "PDF", "file_size_label": "0.8 МБ", "updated_at": date(2026, 2, 20)},
    {"title": "Аккредитация Учебного центра", "category": "license", "app_source": "spektr", "file_format": "PDF", "file_size_label": "1.5 МБ", "updated_at": date(2026, 3, 10)},
    {"title": "Положение о проверке знаний", "category": "regulations", "app_source": "spektr", "file_format": "PDF", "file_size_label": "0.6 МБ", "updated_at": date(2026, 1, 5)},
    {"title": "Регламент работы с электроустановками", "category": "regulations", "app_source": "spektr", "file_format": "PDF", "file_size_label": "2.1 МБ", "updated_at": date(2026, 1, 8)},
    {"title": "Инструкция по охране труда", "category": "regulations", "app_source": "spektr", "file_format": "PDF", "file_size_label": "1.8 МБ", "updated_at": date(2026, 1, 12)},
    {"title": "Образец удостоверения по электробезопасности", "category": "samples", "app_source": "spektr", "file_format": "PDF", "file_size_label": "0.4 МБ", "updated_at": date(2026, 2, 18)},
    {"title": "Образец удостоверения по охране труда", "category": "samples", "app_source": "spektr", "file_format": "PDF", "file_size_label": "0.4 МБ", "updated_at": date(2026, 2, 18)},
    {"title": "Договор на корпоративное обучение (форма)", "category": "contracts", "app_source": "spektr", "file_format": "DOCX", "file_size_label": "0.3 МБ", "updated_at": date(2026, 4, 1)},
    {"title": "Договор на индивидуальное обучение (форма)", "category": "contracts", "app_source": "spektr", "file_format": "DOCX", "file_size_label": "0.3 МБ", "updated_at": date(2026, 4, 1)},
]

WH_DOCS = [
    {"title": "Правила техники безопасности", "category": "Безопасность", "profession": "Все", "app_source": "workhelper", "file_format": "PDF", "pages": 24, "updated_at": date(2026, 1, 15)},
    {"title": "СОП: Работа на токарном станке", "category": "СОП", "profession": "Станочник", "app_source": "workhelper", "file_format": "PDF", "pages": 12, "updated_at": date(2026, 2, 10)},
    {"title": "Инструкция по охране труда", "category": "Охрана труда", "profession": "Все", "app_source": "workhelper", "file_format": "PDF", "pages": 18, "updated_at": date(2026, 1, 5)},
    {"title": "Порядок действий при ЧП", "category": "Безопасность", "profession": "Все", "app_source": "workhelper", "file_format": "PDF", "pages": 8, "updated_at": date(2025, 12, 20)},
    {"title": "СОП: Фрезерные работы", "category": "СОП", "profession": "Фрезеровщик", "app_source": "workhelper", "file_format": "PDF", "pages": 15, "updated_at": date(2026, 2, 1)},
]


def seed(db: Session):
    if db.query(Document).count() > 0:
        print("  Documents: already exist, skipping")
        return
    for data in SPEKTR_DOCS + WH_DOCS:
        db.add(Document(**data))
    db.commit()
    print(f"  Documents: {len(SPEKTR_DOCS) + len(WH_DOCS)} seeded")
