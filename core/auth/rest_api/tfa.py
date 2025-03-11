from ninja import Router
from ninja.errors import HttpError
from ninja.security import HttpBearer
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from .jwt import UserJWTAuth, TFARequired
from .utils import generate_totp_secret, generate_qr_code_uri
import logging
import pyotp

router = Router()
logger = logging.getLogger(__name__)
User = get_user_model()

@router.post("/enable-2fa", auth=UserJWTAuth())
def enable_2fa(request):
    """Initiate 2FA setup process"""
    user = request.auth
    if user.tfa_enabled:
        raise HttpError(400, "2FA already enabled")
    secret = generate_totp_secret()
    uri = generate_qr_code_uri(user.email, secret)
    user.tfa_secret = secret
    user.save()
    return {
        "qr_code_uri": uri,
        "secret": secret,
        "instructions": "Scan QR code with authenticator app"
    }

@router.post("/verify-2fa", auth=UserJWTAuth())
def verify_2fa(request, otp: str):
    """Verify TOTP code during 2FA setup"""
    user = request.auth
    if user.tfa_enabled:
        raise HttpError(400, "2FA already verified")
    totp = pyotp.TOTP(user.tfa_secret)
    if not totp.verify(otp):
        raise HttpError(400, "Invalid OTP")
    user.tfa_enabled = True
    user.tfa_secret = ""  # Clear temporary secret
    user.save()
    return {"success": "2FA successfully enabled"}

@router.post("/disable-2fa", auth=UserJWTAuth())
def disable_2fa(request, otp: str):
    """Disable 2FA with verification"""
    user = request.auth
    if not user.tfa_enabled:
        raise HttpError(400, "2FA not enabled")
    totp = pyotp.TOTP(user.tfa_secret)
    if not totp.verify(otp):
        raise HttpError(400, "Invalid OTP")
    user.tfa_enabled = False
    user.save()
    return {"success": "2FA disabled"}

@router.post("/challenge-2fa", auth=UserJWTAuth())
def challenge_2fa(request, otp: str):
    """Verify TOTP for locked accounts"""
    user = request.auth
    if not user.tfa_locked:
        return {"status": "Account already unlocked"}
    totp = pyotp.TOTP(user.tfa_secret)
    if not totp.verify(otp):
        raise HttpError(400, "Invalid OTP")
    user.tfa_locked = False
    user.save()
    return {"success": "Account unlocked"}

@router.post("/request-2fa-reset")
def request_2fa_reset(request, email: str):
    """Request 2FA reset via email"""
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        raise HttpError(404, "User not found")
    if not user.tfa_enabled:
        raise HttpError(400, "2FA not enabled for this account")
    reset_token = get_random_string(32)
    user.fp_token = reset_token
    user.save()
    reset_link = f"{settings.BASE_URL}/reset-2fa/{reset_token}"
    send_mail(
        "2FA Reset Request",
        f"Use this link to reset your 2FA: {reset_link}",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    return {"success": "Reset instructions sent to email"}

@router.post("/reset-2fa")
def reset_2fa(request, token: str):
    """Reset 2FA using token from email"""
    try:
        user = User.objects.get(fp_token=token)
    except User.DoesNotExist:
        raise HttpError(400, "Invalid or expired token")
    secret = generate_totp_secret()
    uri = generate_qr_code_uri(user.email, secret)
    user.tfa_secret = secret
    user.fp_token = ""
    user.save()
    return {
        "qr_code_uri": uri,
        "secret": secret,
        "instructions": "Scan new QR code with authenticator app"
    }
