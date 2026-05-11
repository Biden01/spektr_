#!/bin/sh
set -e

echo "[spektr] Running database migrations..."
alembic upgrade head

echo "[spektr] Starting API server..."
exec uvicorn main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers ${WORKERS:-1} \
  --log-level $(echo "${LOG_LEVEL:-info}" | tr '[:upper:]' '[:lower:]')
