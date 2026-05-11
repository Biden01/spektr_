import redis
from app.config import settings

_pool = redis.ConnectionPool.from_url(settings.REDIS_URL, decode_responses=True)


def get_redis() -> redis.Redis:
    return redis.Redis(connection_pool=_pool)


def check_redis() -> bool:
    try:
        get_redis().ping()
        return True
    except Exception:
        return False
