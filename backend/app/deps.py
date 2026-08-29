from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .db import get_db
from .models import User
from .security import decode_token

bearer = HTTPBearer(auto_error=False)


def current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if not creds:
        raise HTTPException(401, "Please sign in")
    try:
        user_id = decode_token(creds.credentials)
    except Exception:
        raise HTTPException(401, "Session expired. Sign in again.")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(401, "Account not found")
    return user
