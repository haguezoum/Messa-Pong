from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from core.views import (
    UserViewSet, FriendRequestViewSet, FriendshipViewSet, GameViewSet,
    LoginView, RegisterView, Verify2FAView, PublicUserView, LeaderboardView,
    DashboardView, IsAuthenticatedView, UserProfileView, ProfilePictureUploadView,
    CustomTokenRefreshView, OAuth42LoginView, OAuth42CallbackView, OAuthGoogleLoginView,
    OAuthGoogleCallbackView, UserSearchView, MessageViewSet, FriendshipStatusView, UserBlockViewSet
)
from django.conf import settings
from django.conf.urls.static import static
from core import views, routing

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'friend-requests', FriendRequestViewSet, basename='friend-request')
router.register(r'friends', FriendshipViewSet, basename='friendship')
router.register(r'games', GameViewSet, basename='game')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'blocks', UserBlockViewSet, basename='block')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/is_authenticated/', IsAuthenticatedView.as_view(), name='is_authenticated'),
    path('api/auth/verify_2fa/', Verify2FAView.as_view(), name='verify_2fa'),
    path('api/auth/enable_2fa/', Verify2FAView.as_view(), name='enable_2fa'),
    path('api/auth/42/login/', OAuth42LoginView.as_view(), name='oauth_42_login'),
    path('api/auth/42/callback/', OAuth42CallbackView.as_view(), name='oauth_42_callback'),
    path('api/auth/google/login/', OAuthGoogleLoginView.as_view(), name='oauth_google_login'),
    path('api/auth/google/callback/', OAuthGoogleCallbackView.as_view(), name='oauth_google_callback'),
    path('api/users/me/', UserProfileView.as_view(), name='user-profile'),
    path('api/users/me/upload-picture/', ProfilePictureUploadView.as_view(), name='upload-profile-picture'),
    path('api/users/search/', UserSearchView.as_view(), name='user-search'),
    path('api/users/by-id/<int:id>/', PublicUserView.as_view(), name='public-user-by-id'),
    path('api/users/by-username/<str:username>/', PublicUserView.as_view(), name='public-user'),
    path('api/leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/dashboard/<str:user_id>/', DashboardView.as_view(), name='user-dashboard'),
    path('api/friends/status/<str:user_id>/', FriendshipStatusView.as_view(), name='friendship_status'),
    path('', include(routing.websocket_urlpatterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
