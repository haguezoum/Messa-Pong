from django.urls import path
from .views import (
    TOTPSetupView,
    TOTPVerifyView,
    EmailVerificationView,
    EmailVerificationConfirmView
)

urlpatterns = [
    path('totp/setup/', TOTPSetupView.as_view(), name='totp-setup'),
    path('totp/verify/', TOTPVerifyView.as_view(), name='totp-verify'),
    path('email/send/', EmailVerificationView.as_view(), name='email-verification'),
    path('email/verify/', EmailVerificationConfirmView.as_view(), name='email-verification-confirm'),
] 