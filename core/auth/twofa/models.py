from django.db import models
from django.conf import settings
import pyotp
import qrcode
import base64
import io
from PIL import Image

class TOTPDevice(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    secret_key = models.CharField(max_length=32, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s TOTP Device"

    def save(self, *args, **kwargs):
        if not self.secret_key:
            self.secret_key = pyotp.random_base32()
        super().save(*args, **kwargs)

    def get_totp(self):
        return pyotp.TOTP(self.secret_key)

    def verify_token(self, token):
        totp = self.get_totp()
        return totp.verify(token)

    def get_provisioning_uri(self):
        totp = self.get_totp()
        return totp.provisioning_uri(name=self.user.email, issuer_name="FT Transcendence")

    def get_qr_code(self):
        uri = self.get_provisioning_uri()
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert PIL image to base64 string
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")

class EmailVerification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.user.username}'s Email Verification"

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at 