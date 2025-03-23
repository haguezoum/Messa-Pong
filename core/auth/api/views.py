from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get the profile information for the authenticated user
    """
    user = request.user
    
    # Create response data with user information
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'date_joined': user.date_joined,
        'oauth_42_id': user.oauth_42_id if hasattr(user, 'oauth_42_id') else None,
        'avatar_url': user.avatar_url if hasattr(user, 'avatar_url') else None,
    }
    
    return Response({
        'user': user_data
    }) 