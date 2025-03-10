#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z database 5432; do
    sleep 1
done
echo "PostgreSQL is ready!"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Create superuser if not exists
echo "Creating superuser if not exists..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
END

# Start Django development server
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000 