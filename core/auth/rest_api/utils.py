from django.core.mail import send_mail
from django.conf import settings
import base64
import pyotp
import qrcode
from io import BytesIO

def generate_totp_secret():
    return base64.b32encode(
        pyotp.random_base32().encode()
    ).decode().rstrip('=')

def generate_qr_code_uri(email, secret):
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(
        name=email,
        issuer_name=settings.SITE_NAME
    )
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(uri)
    qr.make(fit=True)
    
    img_buffer = BytesIO()
    qr.make_image(fill='black', back_color='white').save(img_buffer)
    img_buffer.seek(0)
    
    return f"data:image/png;base64,{base64.b64encode(img_buffer.getvalue()).decode()}"


def send_password_reset_email(email: str, reset_url: str):
    subject = "Password Reset Request"
    message = (
        f"Please click the link below to reset your password:\n\n"
        f"{reset_url}\n\n"
        f"If you didn't request this, please ignore this email."
    )
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )
