from django.urls import path
from .views import FortyTwoLoginView, FortyTwoCallbackView

urlpatterns = [
    path('42/login/', FortyTwoLoginView.as_view(), name='42_login'),
    path('42/callback/', FortyTwoCallbackView.as_view(), name='42_callback'),
] 