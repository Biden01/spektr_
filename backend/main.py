import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import check_db
from app.redis_client import check_redis
import app.models  # noqa: F401

from app.routers import (
    auth, users, questions, tests, lessons, documents,
    courses, protocols, mechanisms, mood, notifications,
    training, events, reports, settings as settings_router,
    upload, categories, alert_rules,
)

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("spektr")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Spektr API...")
    if not check_db():
        logger.error("Cannot connect to PostgreSQL — check DATABASE_URL")
    else:
        logger.info("PostgreSQL OK")
    if not check_redis():
        logger.error("Cannot connect to Redis — check REDIS_URL")
    else:
        logger.info("Redis OK")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    logger.info("Spektr API stopped")


app = FastAPI(
    title="Spektr API",
    version="1.0.0",
    description="Backend for Spektr safety training & Workhelper wellness platforms",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.state.limiter = auth.limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)
app.include_router(questions.router, prefix=PREFIX)
app.include_router(tests.router, prefix=PREFIX)
app.include_router(lessons.router, prefix=PREFIX)
app.include_router(documents.router, prefix=PREFIX)
app.include_router(courses.router, prefix=PREFIX)
app.include_router(protocols.router, prefix=PREFIX)
app.include_router(mechanisms.router, prefix=PREFIX)
app.include_router(mood.router, prefix=PREFIX)
app.include_router(notifications.router, prefix=PREFIX)
app.include_router(training.router, prefix=PREFIX)
app.include_router(events.router, prefix=PREFIX)
app.include_router(reports.router, prefix=PREFIX)
app.include_router(settings_router.router, prefix=PREFIX)
app.include_router(upload.router, prefix=PREFIX)
app.include_router(categories.router, prefix=PREFIX)
app.include_router(alert_rules.router, prefix=PREFIX)


@app.get("/health", tags=["ops"])
def health():
    db_ok = check_db()
    redis_ok = check_redis()
    status = "ok" if db_ok and redis_ok else "degraded"
    return {
        "status": status,
        "version": "1.0.0",
        "db": "ok" if db_ok else "error",
        "redis": "ok" if redis_ok else "error",
    }
