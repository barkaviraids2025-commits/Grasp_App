import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import current_user
from ..learning_profile import answers_json, build_profile, order_json
from ..models import Badge, Concept, LearningProfile, StudyPlan, User
from ..profile_engine import QUESTIONS
from ..security import create_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupBody(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str
    phone: str
    password: str = Field(min_length=6)
    preferred_language: str = "english"
    answers: dict


class LoginBody(BaseModel):
    email: str
    password: str


def _pack_user(user: User, profile: LearningProfile | None):
    prof_dict = None if not profile else {
        "pace": profile.pace,
        "focus_window": profile.focus_window,
        "preferred_learning": profile.preferred_learning,
        "problem_solving": profile.problem_solving,
        "retention": profile.retention,
        "revision": profile.revision,
        "motivation": profile.motivation,
        "session_minutes": profile.session_minutes,
        "best_time": profile.best_time,
        "explanation_order": json.loads(profile.explanation_order_json) if profile.explanation_order_json else [],
        "summary": profile.summary,
    }
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "preferred_language": user.preferred_language or "english",
        "xp": user.xp,
        "level": user.level,
        "learning_pace": profile.pace if profile else "Moderate",
        "focus_window_minutes": profile.session_minutes if profile else 30,
        "preferred_learning": profile.preferred_learning if profile else "Examples + Practice",
        "motivation": profile.motivation if profile else "Career-oriented",
        "profile": prof_dict,
    }


@router.get("/questions")
def get_questions():
    return QUESTIONS


@router.post("/signup")
def signup(body: SignupBody, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email.lower()).first():
        raise HTTPException(400, "That email is already registered")
    built = build_profile(body.answers)
    user = User(
        name=body.name.strip(),
        email=body.email.lower().strip(),
        phone=body.phone.strip(),
        password_hash=hash_password(body.password),
        preferred_language=body.preferred_language,
    )
    db.add(user)
    db.flush()
    profile = LearningProfile(
        user_id=user.id,
        answers_json=answers_json(body.answers),
        pace=built["pace"],
        focus_window=built["focus_window"],
        preferred_learning=built["preferred_learning"],
        problem_solving=built["problem_solving"],
        retention=built["retention"],
        revision=built["revision"],
        motivation=built["motivation"],
        session_minutes=built["session_minutes"],
        best_time=built["best_time"],
        explanation_order_json=order_json(built["explanation_order"]),
        summary=built["summary"],
    )
    db.add(profile)
    db.add(
        Badge(
            user_id=user.id,
            key="starter",
            name="Starter 🌱",
            description="Created your personalized learning profile.",
        )
    )
    db.commit()
    db.refresh(user)
    return {"token": create_token(user.id), "user": _pack_user(user, profile)}


@router.post("/login")
def login(body: LoginBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(400, "Email or password is incorrect")
    return {"token": create_token(user.id), "user": _pack_user(user, user.profile)}


@router.get("/me")
def me(user: User = Depends(current_user), db: Session = Depends(get_db)):
    profile = user.profile
    session_minutes = profile.session_minutes if profile else 30
    best_time = profile.best_time if profile else "Evening"
    break_minutes = 8 if (profile and profile.session_minutes < 25) else 5
    note = f"{session_minutes}-minute focused session followed by a {break_minutes}-minute brain pause."

    understood_count = (
        db.query(Concept)
        .join(StudyPlan)
        .filter(StudyPlan.user_id == user.id, Concept.understood.is_(True))
        .count()
    )

    runs = sorted(user.game_runs, key=lambda r: r.created_at, reverse=True)
    if runs:
        try:
            focus_prof = json.loads(runs[0].profile_json)
        except Exception:
            acc = runs[0].accuracy
            focus_prof = {
                "sustained_attention": "Strong" if acc >= 0.8 else "Developing",
                "distraction_resistance": "Strong" if runs[0].mistakes <= 2 else "Developing",
                "working_memory": "Strong" if acc >= 0.75 else "Moderate",
                "best_session_length": f"{session_minutes} min",
                "note": "Observed from recent focus practice.",
            }
    else:
        focus_prof = {
            "sustained_attention": "Not observed yet",
            "distraction_resistance": "Not observed yet",
            "working_memory": "Not observed yet",
            "best_session_length": f"~{session_minutes} min",
            "note": "Play the Daily Puzzle or Focus Quest in the sidebar to measure observed attention.",
        }

    packed = _pack_user(user, profile)
    return {
        "user": packed,
        "profile": packed.get("profile"),
        "session": {
            "session_minutes": session_minutes,
            "best_time": best_time,
            "break_minutes": break_minutes,
            "note": note,
        },
        "stats": {
            "xp": user.xp,
            "level": user.level,
            "plans": len(user.plans),
            "concepts_mastered": understood_count,
            "badges": [
                {
                    "key": b.key,
                    "name": b.name,
                    "description": b.description,
                    "earned_at": b.earned_at.isoformat() if hasattr(b, "earned_at") else "",
                }
                for b in user.badges
            ],
        },
        "focus_profile": focus_prof,
    }
