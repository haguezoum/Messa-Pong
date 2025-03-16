from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class Tuser(AbstractUser):
    class OnlineStatus(models.IntegerChoices):
        OFFLINE = 1, _('Offline')
        ONLINE = 2, _('Online')
    
    class GameStatus(models.IntegerChoices):
        AFK = 1, _('Away')
        PLAYING = 2, _('Playing')

    username = models.CharField(max_length=32, unique=True)
    tmp_otp = models.IntegerField(default=0)
    fname = models.CharField(max_length=64)
    lname = models.CharField(max_length=64)
    email = models.EmailField(max_length=64, unique=True)
    bio = models.CharField(max_length=1024, blank=True)
    verified = models.BooleanField(default=False)
    registration_date = models.DateField(auto_now_add=True)
    image = models.FilePathField()
    score = models.FloatField(default=0.0)
    password_hash = models.CharField(max_length=256)
    friends = models.ManyToManyField("self", blank=True, symmetrical=False, related_name="friend_of")
    blocked = models.ManyToManyField("self", blank=True, symmetrical=False, related_name="blocked_by")
    tfa_enabled = models.BooleanField(default=False)
    tfa_locked = models.BooleanField(default=True)
    tfa_otp = models.IntegerField(default=0)
    fp_token = models.CharField(max_length=64, blank=True)
    tournament_alias = models.CharField(max_length=32, blank=True)
    tournament_code = models.CharField(max_length=100, blank=True)
    online_status = models.IntegerField(choices=OnlineStatus.choices, default=OnlineStatus.OFFLINE)
    game_status = models.IntegerField(choices=GameStatus.choices, default=GameStatus.AFK)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='tuser_set',
        blank=True,
        help_text=_('The groups this user belongs to. A user will get all permissions granted to each of their groups.'),
        verbose_name=_('groups'),
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='tuser_set',
        blank=True,
        help_text=_('Specific permissions for this user.'),
        verbose_name=_('user permissions'),
    )

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return self.username

class Friendship(models.Model):
    class Status(models.IntegerChoices):
        PENDING = 0, _('Pending')
        ACCEPTED = 1, _('Accepted')

    inviter = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='sent_invites')
    invitee = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='received_invites')
    status = models.IntegerField(choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['inviter', 'invitee']

class Game(models.Model):
    class Status(models.IntegerChoices):
        WAITING = 0, _('Waiting')
        ONGOING = 1, _('Ongoing')
        DONE = 2, _('Done')

    token = models.CharField(max_length=64, unique=True)
    player_a = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='games_as_player_a')
    player_b = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='games_as_player_b', null=True)
    status = models.IntegerField(choices=Status.choices, default=Status.WAITING)
    player_a_score = models.IntegerField(default=0)
    player_b_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class Message(models.Model):
    sender = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.CharField(max_length=2048)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class Conversation(models.Model):
    participants = models.ManyToManyField(Tuser, related_name='conversations')
    messages = models.ManyToManyField(Message, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

class Tournament(models.Model):
    class Status(models.IntegerChoices):
        WAITING = 0, _('Waiting')
        ONGOING = 1, _('Ongoing')
        DONE = 2, _('Done')

    code = models.CharField(max_length=100, unique=True)
    players = models.ManyToManyField(Tuser, related_name='tournaments')
    status = models.IntegerField(choices=Status.choices, default=Status.WAITING)
    created_at = models.DateTimeField(auto_now_add=True)
    admin = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='administered_tournaments')

    class Meta:
        ordering = ['-created_at']

class TournamentRound(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='rounds')
    number = models.IntegerField()
    games = models.ManyToManyField(Game, related_name='tournament_round')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['number']
        unique_together = ['tournament', 'number'] 
