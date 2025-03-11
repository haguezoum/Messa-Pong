from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .views import (
    RegisterView,
    LoginView,
    CustomTokenObtainPairView,
    UserProfileView
)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy"})

urlpatterns = [
    # Health check endpoint
    path('health/', health_check, name='health_check'),
    
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoint
    path('profile/', UserProfileView.as_view(), name='user_profile'),
] 