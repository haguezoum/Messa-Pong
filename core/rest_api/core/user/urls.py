from    django.urls import path, re_path, include
from    django.contrib import admin
from    .views import *

urlpatterns = [
        re_path('login', login.as_view()),
        re_path('logout', logout.as_view()),
        re_path('signup', signup.as_view()),
        re_path('profile', profile.as_view()),
        re_path('update_user', UpdateUser.as_view()),
        re_path('user_avatar', UserAvatar.as_view()),
        re_path('add_friend', AddFriend.as_view()),
        re_path('remove_friend', RemoveFriend.as_view()),
        re_path('friends_list', FriendsList.as_view()),
        re_path('users_list', UsersList.as_view()),
        re_path('game_stats', UserGameStats.as_view()),
        re_path('record_ai', RecordAIMatchView.as_view()),
        re_path('record_pvp', RecordPvPMatchView.as_view()),
        re_path('record_tournament', RecordTournamentView.as_view()),
        re_path('pvp_history', UserPvPMatchHistory.as_view()),
        re_path('ai_history', UserAIMatchHistory.as_view()),
        re_path('tournament_history', UserTournamentHistory.as_view()),
        re_path('intra_login', IntraLogin.as_view()),
        re_path('tfa_auth', TFA_Authentication.as_view()),
]
