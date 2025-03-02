"""
ASGI config for game_proj project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_proj.settings')
django.setup()  # Add this line to initialize Django before importing apps

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from game_app.routing import websocket_urlpatterns
from channels.layers import get_channel_layer
from channels.sessions import SessionMiddlewareStack
from django.contrib.sessions.middleware import SessionMiddleware
from channels.security.websocket import AllowedHostsOriginValidator

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            SessionMiddlewareStack(
                URLRouter(
                    websocket_urlpatterns
                )
            )
        )
    ),
})

channel_layer = get_channel_layer()
