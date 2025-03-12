import os
import logging
from django.contrib.auth.hashers import make_password
from django.db import migrations, IntegrityError
from django.core.exceptions import ObjectDoesNotExist

logger = logging.getLogger(__name__)

def get_admin_credentials():
    """Retrieve admin credentials with validation"""
    try:
        username = os.getenv('API_ADMIN', 'admin')
        password = os.getenv('API_PASS', 'admin')
        
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
    
    # Get admin credentials
    admin_credentials = get_admin_credentials()
    
    try:
        # Check if user already exists
        Tuser.objects.get(username=admin_credentials['username'])
        logger.warning("Superuser already exists, skipping creation")
        return
    except ObjectDoesNotExist:
        pass

    try:
        # Create superuser with secure defaults
        Tuser.objects.create(
            username=admin_credentials['username'],
            password=make_password(admin_credentials['password']),
            email=admin_credentials['email'],
            fname=admin_credentials['fname'],
            lname=admin_credentials['lname'],
            verified=True,
            is_staff=True,
            is_superuser=True,
            image='static/anon.png'  # Use the default image we download in init.sh
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
