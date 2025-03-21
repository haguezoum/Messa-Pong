from    django.shortcuts import render
from    django.db.models import Q
from    django.http import FileResponse
from    django.contrib.auth import authenticate
from    django.shortcuts import get_object_or_404
from    django.core.exceptions import ValidationError
from    django.contrib.contenttypes.models import ContentType
from    rest_framework import views
from    rest_framework import status
from    rest_framework import serializers
from    rest_framework.response import Response
from    rest_framework.decorators import api_view
from    rest_framework.generics import ListAPIView
from    rest_framework.authtoken.models import Token
from    rest_framework.exceptions import APIException
from    rest_framework.permissions import IsAuthenticated
from    rest_framework.exceptions import AuthenticationFailed
from    rest_framework.decorators import authentication_classes, permission_classes
from    rest_framework.authentication import SessionAuthentication, TokenAuthentication
from    .serializers import *
from    .models import CustomUser

# Create your views here.

class   CookieTokenAuthentication(TokenAuthentication):

    def authenticate(self, request):

        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed('Unauthenticated due to missing token.')

        return super().authenticate_credentials(token)


""" Authentication : login, logout, signup """


class   login(views.APIView):

    def post(self, request):

        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(username=username, email=email, password=password)
        if user :
            user.online_status = True
            user.save()
            token, created = Token.objects.get_or_create(user=user)
            serializer = CustomUserSerializer(instance=user)
            response = Response(status=status.HTTP_200_OK)
            response.set_cookie(key='jwt', value=token.key, httponly=True, secure=True)
            return response

        return Response({'Error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class   signup(views.APIView):

    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response({'Error': e.message}, status=status.HTTP_400_BAD_REQUEST)

            user = CustomUser.objects.get(username=request.data['username'])
            token, created = Token.objects.get_or_create(user=user)
            response = Response(status=status.HTTP_200_OK)
            response.set_cookie(key='jwt', value=token.key, httponly=True, secure=True)
            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class   logout(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def get(self, request):
        user = request.user
        user.online_status = False
        request.auth.delete()
        user.save()
        return Response({'message': 'User logged out'}, status=status.HTTP_200_OK)


""" User Profile : profile, update, avatar """


class   profile(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def get(self, request):
        user = request.user
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        return Response({'user': serializer.data}, status=status.HTTP_200_OK)


class   UpdateUser(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def put(self, request):

        user = request.user
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'user': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class   UserAvatar(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def get(self, request):
        user = request.user
        
        if user.avatar:
            return FileResponse(open(user.avatar.path, 'rb'))
        return Response({'Error': 'No avatar found'}, status=status.HTTP_400_BAD_REQUEST)


""" Friends : add, remove, list """


class   AddFriend(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def post(self, request):

        friend_username = request.data.get('username')
        if friend_username == request.user.username:
            return Response({'Error': 'You cannot add yourself'}, status=status.HTTP_400_BAD_REQUEST)

        friend = get_object_or_404(CustomUser, username=friend_username)
        if friend in request.user.friends.all():
            return Response({'Error': 'User already in your friend list'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.friends.add(friend)
        return Response({'message': 'Friend added'}, status=status.HTTP_200_OK)


class   RemoveFriend(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def post(self, request):
        friend_username = request.data.get('username')

        if friend_username == request.user.username:
            return Response({'Error': 'You cannot remove yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        friend = get_object_or_404(CustomUser, username=friend_username)
        if friend not in request.user.friends.all():
            return Response({'Error': 'User not in your friend list'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.friends.remove(friend)
        return Response({'message': 'Friend removed'}, status=status.HTTP_200_OK)


class   FriendsList(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]
    def get(self, request):
        try:
            friends = request.user.friends.all()
            friends_data = []
            for friend in friends:
                serializer = CustomUserSerializer(friend)
                friend_data = {
                    'username': serializer.data['username'],
                    'first_name': serializer.data['first_name'],
                    'last_name': serializer.data['last_name'],
                    'avatar_url': serializer.data['avatar_url']
                    'online_status': serializer.data['online_status']
                }
                friends_data.append(friend_data)
            return Response({'friends': friends_data}, status=status.HTTP_200_OK)


class   UsersList(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def get(self, request):
        try:
            users = CustomUser.objects.all()
            users_data = []
            for user in users:
                serializer = CustomUserSerializer(user)
                user_data = {
                    'username': serializer.data['username'],
                    'first_name': serializer.data['first_name'],
                    'last_name': serializer.data['last_name'],
                    'avatar_url': serializer.data['avatar_url']
                    'online_status': serializer.data['online_status']
                }
                users_data.append(user_data)
                return Response({'users': users_data}, status=status.HTTP_200_OK)
        except Exception as e:
            raise APIException(str(e))


""" Game: stats, record ai, record pvp, record tournamant and histories """


class   UserGameStats(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def get(self, request):
        user = request.user
        serializer = UserGameStatsSerializer(user.gamestats)
        return Response({'stats': serializer.data}, status=status.HTTP_200_OK)


class   RecordGameAI(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def post(self, request):
        serializer = AIMatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user_stats = request.user
            stats_data = {
                'total_games': user_stats.total_games + 1,
                'total_ai_games': user_stats.total_ai_games + 1,
                'time_played': user_stats.time_played + request.data['match_duration'],
            }
            stats_serializer = UserGameStatsSerializer(user_stats, data=stats_data, partial=True)
            if stats_serializer.is_valid():
                stats_serializer.save()
            else:
                return Response(stats_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class   RecordGamePvP(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def post(self, request):
        serializer = PvPMatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user_stats = request.user
            stats_data = {
                'total_games': user_stats.total_games + 1,
                'total_pvp_games': user_stats.total_pvp_games + 1,
                'time_played': user_stats.time_played + request.data['match_duration'],
            }
            stats_serializer = UserGameStatsSerializer(user_stats, data=stats_data, partial=True)
            if stats_serializer.is_valid():
                stats_serializer.save()
            else:
                return Response(stats_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class   RecordTournament(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def post(self, request):
        serializer = TournamentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user_stats = request.user
            stats_data = {
                'total_games': user_stats.total_games + 1,
                'total_tournament_played': user_stats.total_tournament_played + 1,
                'time_played': user_stats.time_played + request.data['duration'],
            }
            stats_serializer = UserGameStatsSerializer(user_stats, data=stats_data, partial=True)
            if stats_serializer.is_valid():
                stats_serializer.save()
            else:
                return Response(stats_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class   UserPvPMatchHistory(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]
    serializer_class = PvPMatchSerializer

    def get_queryset(self):
        user = self.request.user
        return PvPMatch.objects.filter(user=user).order_by('-match_date')


class   UserAIMatchHistory(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]
    serializer_class = AIMatchSerializer

    def get_queryset(self):
        user = self.request.user
        return AIMatch.objects.filter(user=user).order_by('-match_date')


class   UserTournamentHistory(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]
    serializer_class = TournamentSerializer

    def get_queryset(self):
        user = self.request.user
        return Tournament.objects.filter(user=user).order_by('-date')


"""" User authentication with 42 intra """"


class   IntraLogin(views.APIView):
    
    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'Error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            'grant_type': 'authorization_code',
            'client_id': settings.INTRA_CLIENT_ID,
            'client_secret': settings.INTRA_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.INTRA_REDIRECT_URI
        }
        response = requests.post('https://api.intra.42.fr/oauth/token', data=data)
        if response.status_code != 200:
            return Response({'Error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)

        access_token = response.json().get('access_token')
        if not access_token:
            return Response({'Error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)

        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        response = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
        if response.status_code != 200:
            return Response({'Error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)

        data = response.json()
        username = data.get('login')
        email = data.get('email')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        avatar_url = data.get('image_url')
        if not username or not email:
            return Response({'Error': 'Invalid user data'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.filter(Q(username=username) | Q(email=email)).first()
        if not user:
            user = CustomUser.objects.create_user(username=username, email=email, password='42intra')
            user.first_name = first_name
            user.last_name = last_name
            user.avatar = avatar_url
            user.save()

        token, created = Token.objects.get_or_create(user=user)
        response = Response(status=status.HTTP_200_OK)
        response.set_cookie(key='jwt', value=token.key, httponly=True, secure=True)
        return response


    """" Lets create tfa authentication with open source library pyotp with qr code """"

class   TFA_Authentication(views.APIView):

    def get(self, request):
        user = request.user
        if user.tfa_enabled:
            return Response({'Error': 'TFA already enabled'}, status=status.HTTP_400_BAD_REQUEST)

        user.tfa_enabled = True
        user.save()
        totp = pyotp.TOTP(pyotp.random_base32())
        uri = totp.provisioning_uri(name=user.username, issuer_name='GameApp')
        img = qrcode.make(uri)
        img.save(f'/tmp/{user.username}.png')
        return FileResponse(open(f'/tmp/{user.username}.png', 'rb'))


    """" Lets create api for chat that handle invite game """"

class   ChatAPI(views.APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieTokenAuthentication]

    def post(self, request):
        user = request.user
        friend_username = request.data.get('username')
        friend = get_object_or_404(CustomUser, username=friend_username)
        if friend not in user.friends.all():
            return Response({'Error': 'User not in your friend list'}, status=status.HTTP_400_BAD_REQUEST)

        message = request.data.get('message')
        if not message:
            return Response({'Error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        chat = Chat.objects.create(user=user, friend=friend, message=message)
        return Response({'message': 'Message sent'}, status=status.HTTP_200_OK)

    def get(self, request):
        user = request.user
        friend_username = request.data.get('username')
        friend = get_object_or_404(CustomUser, username=friend_username)
        if friend not in user.friends.all():
            return Response({'Error': 'User not in your friend list'}, status=status.HTTP_400_BAD_REQUEST)

        chats = Chat.objects.filter(Q(user=user, friend=friend) | Q(user=friend, friend=user)).order_by('date')
        chats_data = []
        for chat in chats:
            chat_data = {
                'user': chat.user.username,
                'friend': chat.friend.username,
                'message': chat.message,
                'date': chat.date
            }
            chats_data.append(chat_data)
        return Response({'chats': chats_data}, status=status.HTTP_200_OK)
