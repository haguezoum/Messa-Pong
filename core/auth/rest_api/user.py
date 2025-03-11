from ninja import Router, File, Form
from ninja.files import UploadedFile
from ninja.security import HttpBearer
from ninja_jwt.tokens import RefreshToken
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.controller import TokenObtainPairController
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.http import HttpRequest, HttpResponse
from rest_api.models import Tuser
from rest_api.settings import REGEX_EMAIL, REGEX_USERNAME, REGEX_NAME
from typing import Optional
import re
import secrets
from zxcvbn import zxcvbn
from rest_api.jwt import send_otp

router = Router()

# Serializers
class UserOutSchema(Schema):
    id: int
    username: str
    fname: str
    lname: str
    email: str
    image: str
    bio: Optional[str]
    score: int
    reg_date: datetime
    status: str

class RegistrationSchema(Schema):
    username: str
    fname: str
    lname: str
    email: str
    password: str
    confirm_password: str

class UpdateSchema(Schema):
    username: Optional[str] = None
    fname: Optional[str] = None
    lname: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    old_password: Optional[str] = None
    bio: Optional[str] = None

# Validators
def validate_password(password: str):
    result = zxcvbn(password)
    if result['score'] < 3:
        raise ValueError("Password too weak")
    return make_password(password)

def validate_username(username: str):
    if not re.fullmatch(REGEX_USERNAME, username):
        raise ValueError("Invalid username format")
    return username

def validate_email(email: str):
    if not re.fullmatch(REGEX_EMAIL, email):
        raise ValueError("Invalid email format")
    return email

def validate_name(name: str):
    if not re.fullmatch(REGEX_NAME, name):
        raise ValueError("Invalid name format")
    return name

# Utils
def generate_secure_otp():
    return secrets.randbelow(900000) + 100000  # 6-digit OTP

def handle_image_upload(img: UploadedFile):
    if not img:
        return settings.DEFAULT_IMG
    
    ext = img.name.split('.')[-1].lower()
    filename = f"{secrets.token_hex(16)}.{ext}"
    with open(settings.UPLOAD_DIR / filename, 'wb+') as destination:
        for chunk in img.chunks():
            destination.write(chunk)
    return filename

# Endpoints
@router.get("/self", response=UserOutSchema, auth=JWTAuth())
def get_self(request):
    return request.auth

@router.get("/user/{str:username}", response=UserOutSchema, auth=JWTAuth())
def get_user_by_username(request, username: str):
    user = Tuser.objects.get(username=username)
    return user

@router.get("/id/{int:user_id}", response=UserOutSchema, auth=JWTAuth())
def get_user_by_id(request, user_id: int):
    return Tuser.objects.get(id=user_id)

@router.post("/register")
def register(request, form: RegistrationSchema = Form(...)):
    if form.password != form.confirm_password:
        return HttpResponse("Passwords don't match", status=400)
    
    try:
        validate_password(form.password)
        validate_username(form.username)
        validate_email(form.email)
        validate_name(form.fname)
        validate_name(form.lname)
    except ValueError as e:
        return HttpResponse(str(e), status=400)
    
    if Tuser.objects.filter(username=form.username).exists():
        return HttpResponse("Username already exists", status=409)
    
    if Tuser.objects.filter(email=form.email).exists():
        return HttpResponse("Email already exists", status=409)
    
    user = Tuser.objects.create(
        username=form.username,
        fname=form.fname,
        lname=form.lname,
        email=form.email,
        password_hash=make_password(form.password),
        tmp_otp=generate_secure_otp(),
        image=settings.DEFAULT_IMG
    )
    
    send_otp(user.tmp_otp, user.email)
    
    refresh = RefreshToken.for_user(user)
    response = HttpResponse(status=201)
    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,
        secure=settings.DEBUG is False,
        samesite='Strict'
    )
    return {"access_token": str(refresh.access_token)}

@router.post("/update")
def update_user(request, 
               form: UpdateSchema = Form(...), 
               image: UploadedFile = File(None)):
    user = request.auth
    
    if form.old_password and not check_password(form.old_password, user.password_hash):
        return HttpResponse("Invalid old password", status=403)
    
    if form.password:
        try:
            user.password_hash = validate_password(form.password)
        except ValueError as e:
            return HttpResponse(str(e), status=400)
    
    if form.username:
        try:
            user.username = validate_username(form.username)
        except ValueError as e:
            return HttpResponse(str(e), status=400)
    
    if form.email:
        try:
            user.email = validate_email(form.email)
        except ValueError as e:
            return HttpResponse(str(e), status=400)
    
    if form.fname:
        try:
            user.fname = validate_name(form.fname)
        except ValueError as e:
            return HttpResponse(str(e), status=400)
    
    if form.lname:
        try:
            user.lname = validate_name(form.lname)
        except ValueError as e:
            return HttpResponse(str(e), status=400)
    
    if image:
        user.image = handle_image_upload(image)
    
    if form.bio:
        user.bio = form.bio
    
    user.save()
    return HttpResponse("User updated successfully", status=200)

@router.post("/login")
def login(request, username: str = Form(...), password: str = Form(...)):
    try:
        user = Tuser.objects.get(username=username)
    except ObjectDoesNotExist:
        try:
            user = Tuser.objects.get(email=username)
        except ObjectDoesNotExist:
            return HttpResponse("Invalid credentials", status=401)
    
    if not check_password(password, user.password_hash):
        return HttpResponse("Invalid credentials", status=401)
    
    refresh = RefreshToken.for_user(user)
    response = HttpResponse(status=200)
    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,
        secure=settings.DEBUG is False,
        samesite='Strict'
    )
    
    if user.tfa_enabled:
        user.tfa_otp = generate_secure_otp()
        user.save()
        send_otp(user.tfa_otp, user.email)
        return {"access_token": str(refresh.access_token), "tfa_required": True}
    
    return {"access_token": str(refresh.access_token)}

@router.post("/logout")
def logout(request):
    try:
        refresh_token = request.COOKIES.get('refresh_token')
        token = RefreshToken(refresh_token)
        token.blacklist()
    except Exception:
        return HttpResponse("Invalid token", status=400)
    
    response = HttpResponse("Logged out successfully", status=200)
    response.delete_cookie('refresh_token')
    return response

@router.post("/verify-otp")
def verify_otp(request, otp: str = Form(...)):
    user = request.auth
    if user.verified:
        return HttpResponse("Already verified", status=200)
    
    if user.tmp_otp != otp:
        return HttpResponse("Invalid OTP", status=400)
    
    user.verified = True
    user.save()
    return HttpResponse("Verification successful", status=200)

@router.post("/enable-2fa")
def enable_2fa(request):
    user = request.auth
    user.tfa_enabled = not user.tfa_enabled
    user.save()
    return {"2fa_status": "enabled" if user.tfa_enabled else "disabled"}

@router.post("/challenge-2fa")
def challenge_2fa(request, otp: str = Form(...)):
    user = request.auth
    if not user.tfa_enabled:
        return HttpResponse("2FA not enabled", status=400)
    
    if user.tfa_otp != otp:
        return HttpResponse("Invalid OTP", status=400)
    
    user.tfa_locked = False
    user.save()
    return HttpResponse("2FA challenge passed", status=200)
