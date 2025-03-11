from ninja import Schema
from typing import Optional, List

class UserSchema(Schema):
    id: int
    username: str

class MessageSchema(Schema):
    sender: str
    content: str
    timestamp: datetime

class ConversationSchema(Schema):
    id: int
    participants: List[UserSchema]
    last_message: Optional[MessageSchema]

class BlockSchema(Schema):
    blocked_user: int
    status: str

class GameSchema(Schema):
    token: str
    status: str
    players: dict
    scores: dict
    created_at: datetime

class GameCreateSchema(Schema):
    token: str
    player_a: str
    status: str

class GameJoinSchema(Schema):
    token: str
    players: list[str]

class GameScoreSchema(Schema):
    token: str
    current_score: dict

class LeaderboardSchema(Schema):
    username: str
    score: float
    image: str

class FriendSchema(Schema):
    id: int
    username: str
    fname: str
    lname: str
    image: str

class InvitationSchema(Schema):
    id: int
    inviter: FriendSchema
    created_at: datetime
