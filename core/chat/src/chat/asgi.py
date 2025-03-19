# import os
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.security.websocket import AllowedHostsOriginValidator
# from apps.messenger.middleware import ChatMiddleware
# from apps.messenger.routing import websocket_urlpatterns
#
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat.settings')
#
# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AllowedHostsOriginValidator(
#         ChatMiddleware(
#             URLRouter(
#                 websocket_urlpatterns
#             )
#         )
#     ),
# })

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat.settings')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from apps.messenger.middleware import ChatMiddleware

django_asgi_app = get_asgi_application()

from apps.messenger.routing import websocket_urlpatterns  # Import here after setup

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        ChatMiddleware(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})
