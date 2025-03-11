from ninja import Router
from ninja.errors import HttpError
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
from django.conf import settings
from .tokens import account_activation_token
from .jwt import UserJWTAuth
from .utils import send_password_reset_email
import logging

router = Router()
logger = logging.getLogger(__name__)
User = get_user_model()

@router.post("/forgot-password")
def forgot_password(request, email: str):
    """Initiate password reset process"""
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal user existence
        return {"success": "If the email exists, instructions will be sent"}
    
    token = account_activation_token.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_url = request.build_absolute_uri(
        reverse('password-reset-confirm', kwargs={'uidb64': uid, 'token': token})
    )
    
    send_password_reset_email(user.email, reset_url)
    return {"success": "Password reset instructions sent"}

@router.post("/reset-password/{uidb64}/{token}")
def reset_password(request, uidb64: str, token: str, new_password: str):
    """Reset password with valid token"""
    try:
        user_id = int(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        raise HttpError(400, "Invalid password reset link")
    
    if not account_activation_token.check_token(user, token):
        raise HttpError(400, "Invalid or expired token")
    
    try:
        validate_password(new_password, user)
    except ValidationError as e:
        raise HttpError(400, " ".join(e.messages))
    
    user.set_password(new_password)
    user.save()
    return {"success": "Password successfully reset"}

@router.post("/delete-account", auth=UserJWTAuth())
def delete_account(request):
    """Permanently delete user account"""
    user = request.auth
    user.delete()
    return {"success": "Account permanently deleted"}
