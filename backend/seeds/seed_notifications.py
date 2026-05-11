from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.user import User


def seed(db: Session):
    user = db.query(User).filter(User.slug == "wh_ivanov").first()
    if not user:
        print("  Notifications: user not found, skipping")
        return
    if db.query(Notification).filter(Notification.user_id == user.id).count() > 0:
        print("  Notifications: already exist, skipping")
        return
    notifications = [
        Notification(user_id=user.id, title="Новое обучение доступно", message="Курс 'Безопасность на производстве' теперь доступен", read=False),
        Notification(user_id=user.id, title="Тест завершен", message="Вы успешно прошли тест по охране труда", read=False),
        Notification(user_id=user.id, title="Напоминание", message="До истечения медосмотра осталось 30 дней", read=True),
        Notification(user_id=user.id, title="Новая инструкция", message="Обновлена СОП по работе на токарном станке", read=True),
    ]
    db.add_all(notifications)
    db.commit()
    print(f"  Notifications: {len(notifications)} seeded")
