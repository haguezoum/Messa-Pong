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
from .views import tfa, password, friendship, game, tournament
from .views.auth import AuthViewSet, auth_42, auth_42_callback
from .views.user import UserViewSet
from .views.chat import ChatViewSet

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='users')
router.register(r'games', game.GameViewSet, basename='games')
router.register(r'tournaments', tournament.TournamentViewSet, basename='tournaments')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Authentication endpoints
    # POST /auth/register/ - Register a new user
    # fetch('/auth/register/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'newuser', password: 'Password123!', email: 'user@example.com', fname: 'First', lname: 'Last' }) })
    path('auth/register/', AuthViewSet.as_view({'post': 'register'}), name='register'),

    # POST /auth/login/ - Login a user
    # fetch('/auth/login/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'existinguser', password: 'Password123!' }) })
    path('auth/login/', AuthViewSet.as_view({'post': 'login'}), name='login'),

    # POST /auth/logout/ - Logout a user
    # fetch('/auth/logout/', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    path('auth/logout/', AuthViewSet.as_view({'post': 'logout'}), name='logout'),

    # TFA endpoints
    # POST /auth/2fa/challenge/ - Verify 2FA OTP
    # fetch('/auth/2fa/challenge/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ otp: '123456' }) })
    path('auth/2fa/challenge/', tfa.challenge_2fa, name='2fa-challenge'),
    
    # POST /auth/2fa/toggle/ - Enable or disable 2FA
    # fetch('/auth/2fa/toggle/', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    path('auth/2fa/toggle/', tfa.toggle_2fa, name='2fa-toggle'),
    
    # POST /auth/2fa/send-code/ - Send 2FA code to user
    # fetch('/auth/2fa/send-code/', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    path('auth/2fa/send-code/', tfa.send_2fa_code, name='2fa-send-code'),
    
    # Password reset endpoints
    # POST /auth/forgot-password/ - Request password reset
    # fetch('/auth/forgot-password/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'user@example.com' }) })
    path('auth/forgot-password/', password.forgot_password, name='forgot-password'),
    
    # POST /auth/reset-password/ - Reset password
    # fetch('/auth/reset-password/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: 'reset-token', password: 'newPassword123!' }) })
    path('auth/reset-password/', password.reset_password, name='reset-password'),
    
    # GET /auth/check-reset-token/ - Check if reset token is valid
    # fetch('/auth/check-reset-token/?token=reset-token', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    path('auth/check-reset-token/', password.check_reset_token, name='check-reset-token'),
    
    # Friendship endpoints
    # GET /friends/ - Get user's friends list
    # fetch('/friends/', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    path('friends/', friendship.get_friends, name='get-friends'),
    
    # GET /friends/requests/ - Get pending friend requests
    # fetch('/friends/requests/', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    path('friends/requests/', friendship.get_friend_requests, name='friend-requests'),
    
    # POST /friends/add/ - Send a friend request
    # fetch('/friends/add/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'friendUsername' }) })
    path('friends/add/', friendship.send_friend_request, name='send-friend-request'),
    
    # POST /friends/handle-request/ - Accept or reject friend request
    # fetch('/friends/handle-request/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'inviterUsername', action: 'accept' }) })
    path('friends/handle-request/', friendship.handle_friend_request, name='handle-friend-request'),
    
    # Chat endpoints
    # POST /create_conv/ - Create a new conversation
    # fetch('/create_conv/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: 'otherUsername' }) })
    path('create_conv/', ChatViewSet.as_view({'post': 'create_conversation'}), name='create-conversation'),
    
    # GET /convos/ - Get all conversations for the current user
    # fetch('/convos/', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    path('convos/', ChatViewSet.as_view({'get': 'conversations'}), name='list-conversations'),
    
    # GET /messages/ - Get all messages for a specific conversation
    # fetch('/messages/?conv_id=conversationId', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    path('messages/', ChatViewSet.as_view({'get': 'messages'}), name='get-messages'),
    
    # POST /register_message/ - Register a new message in a conversation
    # fetch('/register_message/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conv_id: 'conversationId', message: 'Hello!' }) })
    path('register_message/', ChatViewSet.as_view({'post': 'register_message'}), name='register-message'),
    
    # POST /block/ - Block a user from chatting
    # fetch('/block/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: 'userId' }) })
    path('block/', ChatViewSet.as_view({'post': 'block_user'}), name='block-user'),

    #42 authentication endpoint
    path('auth/42/', auth_42, name='auth-42'),
    path('auth/42/callback/', auth_42_callback, name='auth-42-callback'),
]
