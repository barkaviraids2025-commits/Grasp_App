from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .db import Base, engine, get_db
from .deps import current_user
from .models import User
from .profile_engine import QUESTIONS
from .routers import auth, games, plans, progress

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Concepta", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API router for requests prefixed with /api
api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(plans.router)
api_router.include_router(games.router)
api_router.include_router(progress.router)


@api_router.get("/questions")
@app.get("/questions")
def get_global_questions():
    return QUESTIONS


@api_router.get("/me")
def api_me(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return auth.me(user, db)


@api_router.post("/focus")
def api_focus_legacy(body: games.GameBody, user: User = Depends(current_user), db: Session = Depends(get_db)):
    return games._record_game(body, user, db)


@api_router.get("/leaderboard")
def api_leaderboard_shortcut(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return progress.leaderboard(db, user)


app.include_router(api_router)

# Also mount routers directly
app.include_router(auth.router)
app.include_router(plans.router)
app.include_router(games.router)
app.include_router(progress.router)


@app.get("/health")
def health():
    return {"ok": True, "product": "Concepta", "tagline": "Don't study more. Understand better."}
