from django.urls import path
from . import views
from django.views.generic import TemplateView
from local_game import views as local_views

urlpatterns = [
    path('', views.game_view, name='game'),
    path('local/', local_views.local_game, name='local_game'),
]


