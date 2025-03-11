from ninja.security import HttpBearer
from ninja_jwt.authentication import JWTBaseAuthentication
from ninja_jwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from ninja_extra.exceptions import AuthenticationFailed
from django.core.mail import send_mail
from django.conf import settings
from ninja_jwt.tokens import RefreshToken
import logging
from secrets import token_urlsafe

logger = logging.getLogger(__name__)

User = get_user_model()

class TFARequired(AuthenticationFailed):
    pass

class InvalidCredentials(AuthenticationFailed):
    pass

class JWTAuthBase(HttpBearer):
    user_model = User
    require_tfa = False
    admin_only = False

    def authenticate(self, request, token):
        try:
            jwt_auth = JWTBaseAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            
            self.validate_user(user)
            self.check_tfa(user)
            
            return user

        except TokenError:
            raise InvalidCredentials("Invalid or expired token")
        except User.DoesNotExist:
            raise InvalidCredentials("User not found")

    def validate_user(self, user):
        if not user.verified:
            raise InvalidCredentials("User not verified")
        if self.admin_only and not user.is_staff:
            raise InvalidCredentials("Admin access required")

    def check_tfa(self, user):
        if self.require_tfa and user.tfa_enabled and user.tfa_locked:
            otp = self.generate_otp()
            user.tfa_otp = otp
            user.save()
            self.send_otp_email(user.email, otp)
            raise TFARequired("2FA verification required")

    @staticmethod
    def generate_otp():
        return token_urlsafe(3).upper()  # 6-digit alphanumeric OTP

    @staticmethod
    def send_otp_email(email, otp):
        subject = "2FA Verification Code"
        message = f"Your verification code is: {otp}"
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

class UserJWTAuth(JWTAuthBase):
    require_tfa = True

class AdminJWTAuth(JWTAuthBase):
    admin_only = True

class RefreshTokenHandler:
    @staticmethod
    def handle_refresh(request):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if not refresh_token:
                raise InvalidCredentials("Refresh token missing")
                
            refresh = RefreshToken(refresh_token)
            user = User.objects.get(id=refresh["user_id"])
            
            # Optional: Implement token rotation
            refresh.blacklist()
            new_access = RefreshToken.for_user(user).access_token
            
            return str(new_access)
            
        except Exception as e:
            logger.error(f"Refresh token error: {str(e)}")
            raise InvalidCredentials("Invalid refresh token")
