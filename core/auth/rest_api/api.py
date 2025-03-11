from ninja_extra import NinjaExtraAPI
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja.security import django_auth
from rest_api import __version__
from django.conf import settings
from django.contrib.auth import get_user_model

api = NinjaExtraAPI(
    title="API Documentation",
    version=__version__,
    docs_url="/docs/" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    csrf=True,
)

api.register_controllers(NinjaJWTDefaultController)

from .auth import router as auth_router
from .user import router as user_router
from .tfa import router as tfa_router
from .friendships import router as friendships_router
from .chat import router as chat_router
from .game import router as game_router
from .tournament import router as tournament_router
from .restore_password import router as password_router

api.add_router("/auth/", auth_router)
api.add_router("/users/", user_router, auth=django_auth)
api.add_router("/security/", tfa_router, auth=django_auth)
api.add_router("/friends/", friendships_router, auth=django_auth)
api.add_router("/chat/", chat_router, auth=django_auth)
api.add_router("/games/", game_router, auth=django_auth)
api.add_router("/tournaments/", tournament_router, auth=django_auth)
api.add_router("/password/", password_router)

@api.get("/health")
def health_check(request):
    return {"status": "healthy"}

@api.get("/version")
def version_info(request):
    return {"version": __version__}
