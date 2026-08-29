import hashlib
import os
from datetime import datetime, timedelta

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User

SECRET = os.getenv("CONCEPTA_SECRET", "concepta-dev-secret-change-me")
security = HTTPBearer()


def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split("$", 1)
    except ValueError:
        return False
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return check == digest


def create_token(user_id: int) -> str:
    payload = {"sub": str(user_id), "exp": datetime.utcnow() + timedelta(days=14)}
    return jwt.encode(payload, SECRET, algorithm="HS256")


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    try:
        data = jwt.decode(creds.credentials, SECRET, algorithms=["HS256"])
        user = db.get(User, int(data["sub"]))
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Please sign in again.") from exc
    if not user:
        raise HTTPException(status_code=401, detail="Account not found.")
    return user
