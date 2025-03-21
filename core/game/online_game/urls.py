from django.urls import path
from . import views
from django.views.generic import TemplateView
from local_game import views as local_views

urlpatterns = [
    path('', views.game_lobby, name='game_lobby'),
    path('play/<str:room_name>/', views.game_view, name='game_with_room'),
    path('play/', views.game_view, name='game'),
    path('join-queue/', views.join_queue, name='join_queue'),
    path('waiting/', views.waiting_room, name='waiting_room'),
    path('leave-queue/', views.leave_queue, name='leave_queue'),
    path('check-queue-status/', views.check_queue_status, name='check_queue_status'),
    path('local/', local_views.mode_selection, name='mode_selection'),
    path('local/friend/', local_views.friend_mode, name='friend_mode'),
    path('local/ai/', local_views.ai_mode, name='ai_mode'),
]


