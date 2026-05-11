.PHONY: up down build logs shell-backend shell-db migrate seed ps clean

# Запуск всего стека
up:
	docker compose up -d

# Запуск с пересборкой образов
up-build:
	docker compose up -d --build

# Остановка
down:
	docker compose down

# Остановка + удаление volumes (ПОЛНЫЙ СБРОС)
down-volumes:
	docker compose down -v

# Пересборка образов без запуска
build:
	docker compose build

# Логи всех сервисов
logs:
	docker compose logs -f

# Логи только бэкенда
logs-backend:
	docker compose logs -f backend

# Shell внутри бэкенда
shell-backend:
	docker compose exec backend sh

# Psql внутри postgres
shell-db:
	docker compose exec postgres psql -U spektr spektr

# Применить миграции вручную
migrate:
	docker compose exec backend alembic upgrade head

# Залить seed-данные
seed:
	docker compose exec backend python seeds/run_seed.py

# Статус контейнеров
ps:
	docker compose ps

# Удалить неиспользуемые образы/слои
clean:
	docker system prune -f
