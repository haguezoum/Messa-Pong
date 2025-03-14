from django.urls import path
from . import views
from django.views.generic import TemplateView
from local_game import views as local_views

urlpatterns = [
    path('', views.game_view, name='game'),
    path('local/', local_views.mode_selection, name='mode_selection'),
    path('local/friend', local_views.friend_mode, name='friend_mode'),
    path('local/ai', local_views.ai_mode, name='ai_mode'),
]


