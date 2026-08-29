from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import current_user
from ..models import Badge, StudyPlan, User

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("")
def progress(user: User = Depends(current_user), db: Session = Depends(get_db)):
    plans = user.plans
    concepts = [c for p in plans for c in p.concepts]
    mastered = sum(1 for c in concepts if c.understood)
    return {
        "xp": user.xp,
        "level": user.level,
        "topics_completed": sum(1 for p in plans if p.status == "completed"),
        "concepts_mastered": mastered,
        "badges": [
            {"key": b.key, "name": b.name, "description": b.description, "earned_at": b.earned_at.isoformat()}
            for b in user.badges
        ],
        "title": _title_for(user),
    }


def _title_for(user: User) -> str:
    if user.xp >= 800:
        return "Knowledge Master"
    if user.xp >= 400:
        return "Consistent Learner"
    if user.xp >= 120:
        return "Focused Starter"
    return "Curious Beginner"


@router.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db), user: User = Depends(current_user)):
    rows = (
        db.query(User)
        .order_by(User.xp.desc(), User.id.asc())
        .limit(20)
        .all()
    )
    return {
        "entries": [
            {
                "name": u.name,
                "xp": u.xp,
                "level": u.level,
                "me": u.id == user.id,
                "mastered": sum(1 for p in u.plans for c in p.concepts if c.understood),
            }
            for u in rows
        ]
    }
