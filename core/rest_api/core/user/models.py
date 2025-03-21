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
    friends = models.ManyToManyField('self', blank=True)
    online_status = models.BooleanField(default=False)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    objects = CustomeUserManager()
    tfa_enabled = models.BooleanField(default=False)

    total_games = models.IntegerField(default=0)
    time_played = models.IntegerField(default=0)
    total_ai_games = models.IntegerField(default=0)
    total_pvp_games = models.IntegerField(default=0)
    total_tournament_played = models.IntegerField(default=0)

    def __str__(self):
        return self.username


class   AIMatch(models.Model):
    player = models.CharField(max_length=255)
    ai_level = models.CharField(max_length=255)
    winner = models.CharField(max_length=255)
    score = models.CharField(max_length=255)
    match_duration = models.DurationField()
    match_date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.player} ({'won' if self.winner == self.player else 'lost'})"

class   PvPMatch(models.Model):
    player_one = models.CharField(max_length=255)
    player_two = models.CharField(max_length=255)
    winner = models.CharField(max_length=255)
    score = models.CharField(max_length=255)
    match_duration = models.DurationField()
    match_date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.player_one} vs {self.player_two} - Winner: {self.winner}"

class   Tournament(models.Model):
    player_one = models.CharField(max_length=255)
    player_two = models.CharField(max_length=255)
    player_three = models.CharField(max_length=255)
    player_four = models.CharField(max_length=255)
    winner = models.CharField(max_length=255)
    duration = models.DurationField()
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

# class   Message(models.Model):
#     sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
#     content = models.CharField(max_length=2048)
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     class Meta:
#         ordering = ['created_at']
#
# class   Conversation(models.Model):
#     participants = models.ManyToManyField(CustomUser, related_name='conversations')
#     messages = models.ManyToManyField(Message, related_name='conversations')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#
#     class Meta:
#         ordering = ['-updated_at']
