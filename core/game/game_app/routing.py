from django.urls import re_path
from game_app.consumers import PongConsumer

websocket_urlpatterns = [
    re_path(r"ws/game/(?P<room_name>\w+)/$", PongConsumer.as_asgi()),
]
