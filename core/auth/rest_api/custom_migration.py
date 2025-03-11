import os
import logging
from django.contrib.auth.hashers import make_password
from django.db import migrations, IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings

logger = logging.getLogger(__name__)

def get_admin_credentials():
    """Retrieve admin credentials with validation"""
    try:
        username = os.getenv('API_ADMIN')
        password = os.getenv('API_PASS')
        
        if not all([username, password]):
            raise ValueError("Admin credentials not configured")
            
        return {
            'username': username,
            'password': password,
            'email': f"{username}@admin.local",
            'fname': 'Admin',
            'lname': 'User'
        }
    except Exception as e:
        logger.error(f"Failed to retrieve admin credentials: {str(e)}")
        raise

def create_superuser(apps, schema_editor):
    """Create initial superuser with proper error handling"""
    Tuser = apps.get_model('rest_api', 'Tuser')
    
    try:
        # Check if user already exists
        Tuser.objects.get(username=settings.ADMIN_CREDENTIALS['username'])
        logger.warning("Superuser already exists, skipping creation")
        return
    except ObjectDoesNotExist:
        pass

    try:
        # Create superuser with secure defaults
        Tuser.objects.create(
            username=settings.ADMIN_CREDENTIALS['username'],
            password_hash=make_password(settings.ADMIN_CREDENTIALS['password']),
            email=settings.ADMIN_CREDENTIALS['email'],
            fname=settings.ADMIN_CREDENTIALS['fname'],
            lname=settings.ADMIN_CREDENTIALS['lname'],
            verified=True,
            is_staff=True,
            is_superuser=True,
            image=settings.DEFAULT_ADMIN_IMAGE
        )
        logger.info("Successfully created admin user")
    except IntegrityError as e:
        logger.error(f"Database integrity error: {str(e)}")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error creating admin: {str(e)}")
        raise

class Migration(migrations.Migration):

    dependencies = [
        ('rest_api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            create_superuser,
            reverse_code=migrations.RunPython.noop
        ),
    ]
