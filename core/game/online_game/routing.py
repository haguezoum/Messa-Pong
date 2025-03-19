from django.urls import re_path
from online_game.consumers import PongConsumer

websocket_urlpatterns = [
    re_path(r"ws/game/(?P<room_name>\w+)/$", PongConsumer.as_asgi()),
]
