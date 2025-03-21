from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.password_validation import validate_password

# Create your models here.
class   CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, first_name=None, last_name=None, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(username=username.strip(), email=email, first_name=first_name, last_name=last_name, **extra_fields)
        validate_password(password, user)
        user.set_password(password)
        user.save(using=self.db)
        return user

class   CustomUser(AbstractUser):
    username = models.CharField(max_length=15, unique=True, validators=[], error_messages={'unique': "Username Already Exist."})
    email = models.EmailField(unique=True, error_messages={'unique': "Email Already Exist."})
    avatar = models.ImageField(upload_to='uploads/', default='uploads/default.png')
