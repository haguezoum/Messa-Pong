from django.urls import path
from .views import OAuth42RedirectView, OAuth42CallbackView

urlpatterns = [
    # 42 OAuth endpoints
    path('42/login/', OAuth42RedirectView.as_view(), name='oauth_42_login'),
    path('42/callback/', OAuth42CallbackView.as_view(), name='oauth_42_callback'),
]
