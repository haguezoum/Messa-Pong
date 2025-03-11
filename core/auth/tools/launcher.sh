#!/bin/bash

set -e

cd /home/aet-tass/app

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! pg_isready -h database -p 5432 -U postgres; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 2
done
echo "PostgreSQL is ready!"

# Apply database migrations
echo "Applying database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser if not exists
echo "Creating superuser if not exists..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Superuser created successfully!")
else:
    print("Superuser already exists!")
END

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Django development server
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000 