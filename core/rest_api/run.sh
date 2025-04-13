#!/bin/bash
set -e 

source /run/secrets/api-credentials
source /run/secrets/database-credentials

export PYTHONUNBUFFERED=1
export DJANGO_SETTINGS_MODULE=transcendence.settings
export $(grep -v '^#' /run/secrets/api-credentials | xargs)
export $(grep -v '^#' /run/secrets/database-credentials | xargs)

echo "[=] - waiting for database to start"
until nc -z $PG_HOST $PG_PORT; do
    echo "[=] - still waiting..."
    sleep 5
done

echo "[_] - making migrations"
python manage.py collectstatic --noinput --clear
python manage.py makemigrations
python manage.py migrate

echo "[_] - update profile_picture"
mkdir -p /app/media/profile_pics/
wget -q 'https://0x0.st/8p_G.png' -O /app/media/profile_pics/default.png

echo "[+] - starting the rest api server"
daphne -b 0.0.0.0 -p 8000 transcendence.asgi:application
