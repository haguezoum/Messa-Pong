#!/bin/bash

source /run/secrets/database-credentials

export PG_NAME
export PG_USER
export PG_PASSWD
export PG_HOST="database"
export PG_PORT="5432"

until PGPASSWORD="${PG_PASSWD}" psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_NAME}" -c '\q' 2>/dev/null; do
    echo "Postgres is unavailable - sleeping"
    sleep 1
done

echo "Postgres is up - executing commands"

python manage.py collectstatic --noinput --clear
python manage.py makemigrations messenger
python manage.py migrate

exec daphne -b 0.0.0.0 -p 8002 chat.asgi:application 
