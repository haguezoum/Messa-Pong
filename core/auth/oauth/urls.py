from django.urls import path
from . import views

urlpatterns = [
    path('42/login/', views.FortyTwoLoginView.as_view(), name='42_login'),
    path('42/callback/', views.FortyTwoCallbackView.as_view(), name='42_callback'),
] 