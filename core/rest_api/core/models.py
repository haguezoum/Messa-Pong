from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.core.validators import RegexValidator


class User(AbstractUser):
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[RegexValidator(
            regex=r'^\+[0-9]{10,15}$',
            message='Phone number must be in the format: +1234567890 (10-15 digits)'
        )],
    )
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        blank=True,
        null=True,
        default='profile_pics/default.png'
    )
    is_2fa_enabled = models.BooleanField(default=False)
    total_games = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    oauth_42_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    oauth_google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

    objects = UserManager()

    @property
    def win_rate(self):
        return round((self.wins / self.total_games * 100) if self.total_games > 0 else 0)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_users',
        blank=True,
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_users',
        blank=True,
        help_text='Specific permissions for this user.'
    )

    def __str__(self):
        return self.username


class FriendRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')


class Friendship(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships')
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friends_of')
    since = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'friend')
        
    def __str__(self):
        return f"{self.user.username} is friends with {self.friend.username}"


class UserBlock(models.Model):
    """Model for blocking users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocking')
    blocked_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'blocked_user')
        
    def __str__(self):
        return f"{self.user.username} blocked {self.blocked_user.username}"


class Game(models.Model):
    players = models.ManyToManyField(User, related_name='games')
    winner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='won_games')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)


class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_emoji = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} to {self.recipient.username}: {self.content[:20]}"
