from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
import logging

logger = logging.getLogger(__name__)

class ChatMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        scope['user'] = await self.GetUser(scope)
        
        logger.info(f"WebSocket connection from {scope['client']}")
        
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def GetUser(self, scope):
        # TODO: Implement user authentication logic here (e.g., JWT token validation)
        # For now, return None as a placeholder
        return None 
