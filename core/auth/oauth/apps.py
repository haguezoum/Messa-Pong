from django.apps import AppConfig

class OAuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'oauth'
    verbose_name = 'OAuth Authentication' 