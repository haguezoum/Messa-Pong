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

# Wait for database to be ready
while ! nc -z $PG_HOST $PG_PORT; do
    echo "Waiting for database..."
    sleep 1
done

# Remove any existing migrations
rm -rf api/migrations/*

# Create a new migrations directory if it doesn't exist
mkdir -p api/migrations
touch api/migrations/__init__.py

# Make migrations and migrate
python manage.py makemigrations api
python manage.py migrate

echo "[_] - creating uploads"
mkdir -p media/avatars
wget -q 'https://0x0.st/X4BZ.png' -O media/avatars/default.png

echo "[+] - starting the rest api server"
exec python manage.py runserver 0.0.0.0:8000
