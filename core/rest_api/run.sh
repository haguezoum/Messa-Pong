#!/bin/bash
set -e 

source /run/secrets/api-credentials
source /run/secrets/database-credentials

export PYTHONUNBUFFERED=1
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

echo "[_] - creating uploads"
mkdir -p media/avatars
wget -q 'https://0x0.st/X4BZ.png' -O media/avatars/default.png

echo "[+] - starting the rest api server"
python manage.py runserver 0.0.0.0:8000
