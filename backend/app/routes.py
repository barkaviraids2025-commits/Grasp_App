from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .ai_engine import evaluate_answers, explain_concept, generate_questions, next_mode
from .auth import create_token, get_current_user, hash_password, verify_password
from .database import get_db
from .extract import extract_text, split_concepts
from .gamification import add_xp, award, level_for_xp
from .models import (
    Badge,
    Concept,
    FocusRun,
    LearningProfile,
    OnboardingAnswer,
    ScheduleDay,
    StudyPlan,
    User,
)
from .notes import build_notes_pdf
from .planner import build_schedule, session_plan
from .profile_engine import QUESTIONS, build_learning_profile

router = APIRouter()
UPLOADS = Path(__file__).resolve().parents[1] / "uploads"
UPLOADS.mkdir(exist_ok=True)


class SignupIn(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    preferred_language: str = "english"
    answers: dict[str, str]


class LoginIn(BaseModel):
    email: str
    password: str


class CheckIn(BaseModel):
    answers: dict
    own_words: str = ""
    language: str = "english"


class FocusIn(BaseModel):
    game: str
    accuracy: float
    reaction_ms: float = 0
    mistakes: int = 0
    payload: dict = {}


@router.get("/questions")
def questions():
    return QUESTIONS


@router.post("/auth/signup")
def signup(body: SignupIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email.lower()).first():
        raise HTTPException(400, "That email is already registered.")
    if len(body.answers) < 15:
        raise HTTPException(400, "Please answer every learning-profile question.")
    user = User(
        name=body.name.strip(),
        email=body.email.lower().strip(),
        phone=body.phone.strip(),
        password_hash=hash_password(body.password),
        preferred_language=body.preferred_language,
    )
    db.add(user)
    db.flush()
    for qid, choice in body.answers.items():
        db.add(OnboardingAnswer(user_id=user.id, question_id=qid, choice=choice))
    profile = build_learning_profile(body.answers)
    db.add(LearningProfile(user_id=user.id, payload=json.dumps(profile)))
    db.commit()
    return {"token": create_token(user.id), "user": public_user(user, profile)}


@router.post("/auth/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(400, "Email or password is not right.")
    profile = _profile(db, user.id)
    return {"token": create_token(user.id), "user": public_user(user, profile)}


@router.get("/me")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _profile(db, user.id)
    understood = (
        db.query(Concept)
        .join(StudyPlan)
        .filter(StudyPlan.user_id == user.id, Concept.understood.is_(True))
        .count()
    )
    return {
        "user": public_user(user, profile),
        "profile": profile,
        "session": session_plan(profile),
        "stats": {
            "xp": user.xp,
            "level": level_for_xp(user.xp),
            "plans": db.query(StudyPlan).filter(StudyPlan.user_id == user.id).count(),
            "concepts_mastered": understood,
            "badges": [{"key": b.key, "name": b.name} for b in user.badges],
        },
        "focus_profile": focus_profile(user),
    }


@router.post("/plans/upload")
async def upload_plan(
    deadline_days: int = Form(...),
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = await file.read()
    if not data:
        raise HTTPException(400, "Empty file.")
    path = UPLOADS / f"{user.id}_{file.filename}"
    path.write_bytes(data)
    text = extract_text(file.filename, data)
    concepts = split_concepts(text, Path(file.filename).stem)
    profile = _profile(db, user.id)
    plan = StudyPlan(
        user_id=user.id,
        title=Path(file.filename).stem.replace("_", " ") or "Quantitative analysis",
        filename=file.filename,
        deadline_days=max(1, deadline_days),
        source_excerpt=text[:4000],
    )
    db.add(plan)
    db.flush()
    stored = []
    for i, c in enumerate(concepts):
        row = Concept(
            plan_id=plan.id,
            title=c["title"],
            body=c["body"],
            difficulty=c["difficulty"],
            depends_on=c.get("depends_on") or "",
            order_index=i,
            estimated_minutes=session_plan(profile)["session_minutes"],
        )
        db.add(row)
        stored.append(c)
    days = build_schedule(stored, deadline_days, profile)
    for d in days:
        db.add(
            ScheduleDay(
                plan_id=plan.id,
                day_number=d["day_number"],
                title=d["title"],
                items=json.dumps(d["items"]),
            )
        )
    if db.query(StudyPlan).filter(StudyPlan.user_id == user.id).count() == 1:
        award(user, db, "starter")
    db.commit()
    db.refresh(plan)
    return serialize_plan(plan)


@router.get("/plans")
def list_plans(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plans = db.query(StudyPlan).filter(StudyPlan.user_id == user.id).order_by(StudyPlan.id.desc()).all()
    return [serialize_plan(p) for p in plans]


@router.get("/plans/{plan_id}")
def get_plan(plan_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.get(StudyPlan, plan_id)
    if not plan or plan.user_id != user.id:
        raise HTTPException(404, "Plan not found.")
    return serialize_plan(plan)


@router.get("/learn/{concept_id}")
def learn(
    concept_id: int,
    mode: str | None = None,
    language: str = "english",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    concept = _owned_concept(db, user, concept_id)
    use_mode = mode or concept.explanation_mode
    explanation = explain_concept(concept.title, concept.body, use_mode, language)
    questions = generate_questions(concept.title, concept.body)
    profile = _profile(db, user.id)
    return {
        "concept": serialize_concept(concept),
        "explanation": explanation,
        "questions": questions,
        "session": session_plan(profile),
        "philosophy": "If you don't understand it, we don't move on.",
    }


@router.post("/learn/{concept_id}/again")
def explain_again(
    concept_id: int,
    language: str = "english",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    concept = _owned_concept(db, user, concept_id)
    concept.explanation_mode = next_mode(concept.explanation_mode)
    concept.attempts += 1
    db.commit()
    return {
        "mode": concept.explanation_mode,
        "explanation": explain_concept(concept.title, concept.body, concept.explanation_mode, language),
        "note": "Same idea, different door in. Not a judgement of ability.",
    }


@router.post("/learn/{concept_id}/check")
def check(
    concept_id: int,
    body: CheckIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    concept = _owned_concept(db, user, concept_id)
    concept.attempts += 1
    result = evaluate_answers(body.answers, body.own_words, concept.title, concept.body)
    if result["understood"]:
        concept.understood = True
        add_xp(user, 20)
        if result["score"] >= 90:
            award(user, db, "concept_master")
        if concept.attempts > 1:
            award(user, db, "deep_learner")
        plan = db.get(StudyPlan, concept.plan_id)
        if plan and all(c.understood for c in plan.concepts):
            plan.status = "completed"
            add_xp(user, 50)
            award(user, db, "starter")
            completed = db.query(StudyPlan).filter(StudyPlan.user_id == user.id, StudyPlan.status == "completed").count()
            if completed >= 3:
                award(user, db, "consistency")
            if completed >= 10:
                award(user, db, "knowledge_master")
            if plan.deadline_days:
                award(user, db, "fast_learner")
    else:
        concept.explanation_mode = next_mode(concept.explanation_mode)
    db.commit()
    return {
        **result,
        "next_mode": concept.explanation_mode,
        "understood": concept.understood,
        "xp": user.xp,
    }


@router.get("/plans/{plan_id}/notes.pdf")
def notes_pdf(plan_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.get(StudyPlan, plan_id)
    if not plan or plan.user_id != user.id:
        raise HTTPException(404, "Plan not found.")
    concepts = [{"title": c.title, "body": c.body} for c in sorted(plan.concepts, key=lambda x: x.order_index)]
    pdf = build_notes_pdf(plan.title, concepts, [])
    return Response(pdf, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="concepta-{plan.id}.pdf"'})


@router.post("/focus")
def save_focus(body: FocusIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    run = FocusRun(
        user_id=user.id,
        game=body.game,
        accuracy=body.accuracy,
        reaction_ms=body.reaction_ms,
        mistakes=body.mistakes,
        payload=json.dumps(body.payload),
    )
    db.add(run)
    add_xp(user, 8)
    db.commit()
    return {"ok": True, "focus_profile": focus_profile(user), "xp": user.xp}


@router.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    people = db.query(User).order_by(User.xp.desc()).limit(20).all()
    return [
        {
            "name": u.name,
            "xp": u.xp,
            "level": level_for_xp(u.xp),
            "you": u.id == user.id,
        }
        for u in people
    ]


def public_user(user: User, profile: dict) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "preferred_language": user.preferred_language,
        "xp": user.xp,
        "level": level_for_xp(user.xp),
        "learning_pace": profile.get("learning_pace"),
        "focus_window_minutes": profile.get("focus_window_minutes"),
        "preferred_learning": profile.get("preferred_learning"),
        "motivation": profile.get("motivation"),
    }


def _profile(db: Session, user_id: int) -> dict:
    row = db.query(LearningProfile).filter(LearningProfile.user_id == user_id).first()
    if not row:
        return build_learning_profile({})
    return json.loads(row.payload)


def serialize_concept(c: Concept) -> dict:
    return {
        "id": c.id,
        "title": c.title,
        "difficulty": c.difficulty,
        "depends_on": c.depends_on,
        "understood": c.understood,
        "attempts": c.attempts,
        "explanation_mode": c.explanation_mode,
        "estimated_minutes": c.estimated_minutes,
        "body": c.body,
    }


def serialize_plan(plan: StudyPlan) -> dict:
    concepts = sorted(plan.concepts, key=lambda x: x.order_index)
    done = sum(1 for c in concepts if c.understood)
    days = []
    for d in sorted(plan.days, key=lambda x: x.day_number):
        days.append({"day_number": d.day_number, "title": d.title, "items": json.loads(d.items)})
    return {
        "id": plan.id,
        "title": plan.title,
        "filename": plan.filename,
        "deadline_days": plan.deadline_days,
        "status": plan.status,
        "created_at": plan.created_at.isoformat(),
        "progress": 0 if not concepts else round(100 * done / len(concepts)),
        "concepts": [serialize_concept(c) for c in concepts],
        "schedule": days,
        "next_concept": next((serialize_concept(c) for c in concepts if not c.understood), None),
    }


def _owned_concept(db: Session, user: User, concept_id: int) -> Concept:
    concept = db.get(Concept, concept_id)
    if not concept:
        raise HTTPException(404, "Concept not found.")
    plan = db.get(StudyPlan, concept.plan_id)
    if not plan or plan.user_id != user.id:
        raise HTTPException(404, "Concept not found.")
    return concept


def focus_profile(user: User) -> dict:
    runs = user.focus_runs[-8:]
    if not runs:
        return {
            "sustained_attention": "Not observed yet",
            "distraction_resistance": "Not observed yet",
            "working_memory": "Not observed yet",
            "best_session_length": "Use your signup window until you play Focus Quest",
        }
    acc = sum(r.accuracy for r in runs) / len(runs)
    react = sum(r.reaction_ms for r in runs) / max(len(runs), 1)
    quest = [r for r in runs if r.game == "focus-quest"]

    def label(v: float) -> str:
        if v >= 0.8:
            return "Strong"
        if v >= 0.55:
            return "Developing"
        return "Building"

    mem = label(acc)
    dist = label(sum(r.accuracy for r in quest) / len(quest) if quest else acc)
    session = "15–20 min" if acc < 0.5 else "~25–30 min" if acc < 0.8 else "30–40 min"
    return {
        "sustained_attention": label(acc),
        "distraction_resistance": dist,
        "working_memory": mem,
        "best_session_length": session,
        "avg_reaction_ms": round(react),
        "note": "Observed from today's puzzles, not a diagnosis. Sleep and stress change this.",
    }
