from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
import uuid

class Tuser(AbstractUser):
    username = models.CharField(_('username'), max_length=32, unique=True)
    fname = models.CharField(_('first name'), max_length=64)
    lname = models.CharField(_('last name'), max_length=64)
    email = models.EmailField(_('email address'), unique=True)
    bio = models.TextField(_('bio'), blank=True)
    verified = models.BooleanField(_('verified'), default=False)
    image = models.ImageField(_('profile image'), upload_to='profiles/', blank=True)
    score = models.FloatField(_('score'), default=0.0)
    tfa_enabled = models.BooleanField(default=False)
    tfa_secret = models.CharField(max_length=32, blank=True)
    tfa_locked = models.BooleanField(default=False)
    fp_token = models.CharField(max_length=64, blank=True)
    reset_token = models.CharField(_('password reset token'), max_length=64, blank=True)
    
    friends = models.ManyToManyField('self', through='Friendship', symmetrical=False)
    blocked_users = models.ManyToManyField('self', symmetrical=False, blank=True)
    
    class Status(models.TextChoices):
        ONLINE = 'online', _('Online')
        OFFLINE = 'offline', _('Offline')
        IN_GAME = 'in_game', _('In Game')
    
    status = models.CharField(_('status'), max_length=10, choices=Status.choices, default=Status.OFFLINE)
    
    def __str__(self):
        return self.username

class Friendship(models.Model):
    class Status(models.IntegerChoices):
        PENDING = 0, _('Pending')
        ACCEPTED = 1, _('Accepted')
    
    inviter = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='sent_requests')
    invitee = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='received_requests')
    status = models.IntegerField(_('status'), choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

class Game(models.Model):
    token = models.UUIDField(_('game token'), default=uuid.uuid4, unique=True)
    player_a = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='games_a')
    player_b = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='games_b')
    
    class Status(models.IntegerChoices):
        WAITING = 0, _('Waiting')
        ONGOING = 1, _('Ongoing')
        COMPLETED = 2, _('Completed')
    
    status = models.IntegerField(_('status'), choices=Status.choices, default=Status.WAITING)
    score_a = models.IntegerField(_('player A score'), default=0)
    score_b = models.IntegerField(_('player B score'), default=0)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

class Message(models.Model):
    conversation = models.ForeignKey('Conversation', on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Tuser, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(_('message content'))
    timestamp = models.DateTimeField(_('timestamp'), auto_now_add=True)

class Conversation(models.Model):
    participants = models.ManyToManyField(Tuser, related_name='conversations')
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

class Tournament(models.Model):
    class Status(models.IntegerChoices):
        WAITING = 0
        ONGOING = 1
        COMPLETED = 2

    code = models.CharField(max_length=12, unique=True)
    admin = models.ForeignKey(Tuser, on_delete=models.CASCADE)
    players = models.ManyToManyField(Tuser, related_name='tournaments')
    current_round = models.ForeignKey('TournamentRound', null=True, blank=True,
                                     on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(choices=Status.choices, default=Status.WAITING)

    @classmethod
    def generate_code(cls):
        return binascii.hexlify(os.urandom(6)).decode()

class TournamentRound(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    round_number = models.IntegerField()
    games = models.ManyToManyField(Game)
    completed = models.BooleanField(default=False)

    @property
    def is_completed(self):
        return all(game.status == Game.Status.COMPLETED for game in self.games.all())

    def get_winners(self):
        return [game.get_winner() for game in self.games.all() if game.get_winner()]
