import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import current_user
from ..models import GameRun, User

router = APIRouter(prefix="/games", tags=["games"])


class GameBody(BaseModel):
    game: str = "focus-game"
    accuracy: float = 1.0
    reaction_ms: float = 0.0
    mistakes: int = 0
    score: int | None = None
    payload: dict | None = None
    rounds: dict | None = None


def focus_profile(accuracy: float, reaction_ms: float, mistakes: int) -> dict:
    sustained = "Strong" if accuracy >= 0.85 else "Developing" if accuracy >= 0.6 else "Building"
    distract = "Strong" if mistakes <= 2 else "Developing" if mistakes <= 5 else "Building"
    memory = "Strong" if accuracy >= 0.8 else "Moderate" if accuracy >= 0.55 else "Building"
    if reaction_ms and reaction_ms > 1800:
        session = "15–20 min"
    elif reaction_ms and reaction_ms < 700:
        session = "30–40 min"
    else:
        session = "25–30 min"
    return {
        "sustained_attention": sustained,
        "distraction_resistance": distract,
        "working_memory": memory,
        "best_session_length": session,
        "note": "This is observed practice today, not a diagnosis. Sleep, stress, and prior knowledge all move these scores.",
    }


def _record_game(body: GameBody, user: User, db: Session):
    score = body.score if body.score is not None else int(body.accuracy * 100)
    profile = focus_profile(body.accuracy, body.reaction_ms, body.mistakes)
    run = GameRun(
        user_id=user.id,
        game=body.game,
        accuracy=body.accuracy,
        reaction_ms=body.reaction_ms,
        mistakes=body.mistakes,
        score=score,
        profile_json=json.dumps(profile),
    )
    db.add(run)
    user.xp += 10
    db.commit()
    return {"xp": user.xp, "profile": profile, "focus_profile": profile}


@router.post("/complete")
def complete(body: GameBody, user: User = Depends(current_user), db: Session = Depends(get_db)):
    return _record_game(body, user, db)


@router.post("/focus")
def focus_alias(body: GameBody, user: User = Depends(current_user), db: Session = Depends(get_db)):
    return _record_game(body, user, db)


@router.get("/latest")
def latest(user: User = Depends(current_user)):
    runs = sorted(user.game_runs, key=lambda r: r.created_at, reverse=True)
    if not runs:
        return {"profile": None}
    latest_run = runs[0]
    return {"profile": json.loads(latest_run.profile_json), "game": latest_run.game}
