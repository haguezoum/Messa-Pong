"""
URL configuration for api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import tfa, password, friendship, auth, chat, game, tournament, user
from .views.auth import AuthViewSet
from .views.user import UserViewSet
from .views.tournament import TournamentViewSet
from .views.chat import ChatViewSet
from .views.game import GameViewSet

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # TFA endpoints
    path('auth/2fa/challenge/', tfa.challenge_2fa, name='2fa-challenge'),
    path('auth/2fa/toggle/', tfa.toggle_2fa, name='2fa-toggle'),
    path('auth/2fa/send-code/', tfa.send_2fa_code, name='2fa-send-code'),
    
    # Password reset endpoints
    path('auth/forgot-password/', password.forgot_password, name='forgot-password'),
    path('auth/reset-password/', password.reset_password, name='reset-password'),
    path('auth/check-reset-token/', password.check_reset_token, name='check-reset-token'),
    
    # Friendship endpoints
    path('friends/', friendship.get_friends, name='get-friends'),
    path('friends/requests/', friendship.get_friend_requests, name='friend-requests'),
    path('friends/add/', friendship.send_friend_request, name='send-friend-request'),
    path('friends/handle-request/', friendship.handle_friend_request, name='handle-friend-request'),
    path('create_conv/', ChatViewSet.as_view({'post': 'create_conversation'}), name='create-conversation'),
    path('convos/', ChatViewSet.as_view({'get': 'conversations'}), name='list-conversations'),
    path('messages/', ChatViewSet.as_view({'get': 'messages'}), name='get-messages'),
    path('register_message/', ChatViewSet.as_view({'post': 'register_message'}), name='register-message'),
    path('block/', ChatViewSet.as_view({'post': 'block_user'}), name='block-user'),

]
