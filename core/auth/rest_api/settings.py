import os
from pathlib import Path
import environ
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# Core settings
SECRET_KEY = env('DJANGO_SECRET_KEY', default='django-insecure-0*9y@=q#t#l@=)p5h!q%k$4i!@v^$f3j7k5i!@v^$f3j7k5i')
DEBUG = env.bool('DEBUG', default=True)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1', 'auth', '*'])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'ninja',
    'ninja_extra',
    'ninja_jwt',
    'corsheaders',
    'rest_api',  # Your app
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'rest_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'rest_api.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='postgres'),
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASSWORD', default='postgres'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

AUTH_USER_MODEL = 'rest_api.Tuser'

SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=False)
SESSION_COOKIE_SECURE = env.bool('SESSION_COOKIE_SECURE', default=False)
CSRF_COOKIE_SECURE = env.bool('CSRF_COOKIE_SECURE', default=False)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

CORS_ALLOW_ALL_ORIGINS = env.bool('CORS_ALLOW_ALL', default=True)
CORS_ALLOW_CREDENTIALS = True

API_VERSION = '1.0.0'
API_PREFIX = '/api'

NINJA_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env('EMAIL_HOST', default='smtp.example.com')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='user@example.com')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='password')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@example.com')

API_42_CLIENT_ID = env('API_42_CLIENT_ID')
API_42_CLIENT_SECRET = env('API_42_CLIENT_SECRET')
API_42_REDIRECT_URI = env('API_42_REDIRECT_URI', default='http://localhost:8000/callback')
API_42_AUTHORIZE_URL = 'https://api.intra.42.fr/oauth/authorize'
API_42_TOKEN_URL = 'https://api.intra.42.fr/oauth/token'
API_42_USER_INFO_URL = 'https://api.intra.42.fr/v2/me'

MAX_TOURNAMENT_PLAYERS = env.int('MAX_TOURNAMENT_PLAYERS', default=8)
DEFAULT_ADMIN_IMAGE = 'default/admin.png'

UPLOAD_DIR = os.path.join(MEDIA_ROOT, 'uploads/')
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

SITE_NAME = env('SITE_NAME', default='My Awesome API')

# Validation Regex Patterns
REGEX_EMAIL = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
REGEX_USERNAME = r'^[a-zA-Z0-9_-]{3,32}$'  # 3-32 chars, alphanumeric, underscore, hyphen
REGEX_NAME = r'^[a-zA-Z\s-]{2,64}$'  # 2-64 chars, letters, spaces, hyphens

# Add this setting to fix the auto-field warnings
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configure CSRF settings for working behind a proxy
CSRF_TRUSTED_ORIGINS = ['http://localhost', 'http://127.0.0.1']
