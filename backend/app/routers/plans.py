import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..ai_engine import analyze_source, explanations_for, generate_questions, score_own_words
from ..db import get_db
from ..deps import current_user
from ..models import Badge, Concept, PlanSession, StudyPlan, User
from ..pdf_notes import build_notes_pdf
from ..scheduler import build_schedule, dump_ids

router = APIRouter(prefix="/plans", tags=["plans"])
UPLOADS = Path(__file__).resolve().parents[2] / "uploads"
UPLOADS.mkdir(exist_ok=True)

BADGE_CATALOG = {
    "starter": ("Starter", "Completed your first learning plan."),
    "consistency": ("Consistency", "Completed 3 schedules."),
    "concept-master": ("Concept Master", "Scored 90%+ on a concept check."),
    "fast-learner": ("Fast Learner", "Finished a plan inside the deadline with understanding."),
    "deep-learner": ("Deep Learner", "Mastered a concept after multiple explanation attempts."),
    "knowledge-master": ("Knowledge Master", "Completed 10 learning plans."),
}


def _award(db: Session, user: User, key: str):
    if db.query(Badge).filter(Badge.user_id == user.id, Badge.key == key).first():
        return
    name, desc = BADGE_CATALOG[key]
    db.add(Badge(user_id=user.id, key=key, name=name, description=desc))
    user.xp += 100


def _maybe_level(user: User):
    user.level = 1 + user.xp // 200


def serialize_plan(plan: StudyPlan):
    return {
        "id": plan.id,
        "title": plan.title,
        "source_name": plan.source_name,
        "deadline_days": plan.deadline_days,
        "status": plan.status,
        "concepts": [
            {
                "id": c.id,
                "title": c.title,
                "summary": c.summary,
                "difficulty": c.difficulty,
                "order_index": c.order_index,
                "understood": c.understood,
                "attempts": c.attempts,
                "last_score": c.last_score,
            }
            for c in sorted(plan.concepts, key=lambda x: x.order_index)
        ],
        "sessions": [
            {
                "id": s.id,
                "day_number": s.day_number,
                "title": s.title,
                "minutes": s.minutes,
                "kind": s.kind,
                "concept_ids": json.loads(s.concept_ids_json),
                "completed": s.completed,
            }
            for s in sorted(plan.sessions, key=lambda x: (x.day_number, x.id))
        ],
        "progress": (
            0
            if not plan.concepts
            else round(100 * sum(1 for c in plan.concepts if c.understood) / len(plan.concepts))
        ),
    }


@router.get("")
def list_plans(user: User = Depends(current_user)):
    return {"plans": [serialize_plan(p) for p in user.plans]}


@router.post("/upload")
async def upload_plan(
    deadline_days: int = Form(...),
    file: UploadFile = File(...),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    allowed = {".pdf", ".pptx", ".ppt", ".txt", ".md"}
    suffix = Path(file.filename or "notes.txt").suffix.lower()
    if suffix not in allowed:
        raise HTTPException(400, "Upload a PDF, PPT, or text notes")
    dest = UPLOADS / f"{user.id}_{file.filename}"
    dest.write_bytes(await file.read())
    extracted = analyze_source(dest)
    plan = StudyPlan(
        user_id=user.id,
        title=Path(file.filename).stem.replace("_", " ").title(),
        source_name=file.filename or "source",
        deadline_days=max(1, deadline_days),
    )
    db.add(plan)
    db.flush()
    stored = []
    for i, item in enumerate(extracted):
        c = Concept(
            plan_id=plan.id,
            title=item["title"],
            summary=item["summary"],
            source_excerpt=item["source_excerpt"],
            difficulty=item["difficulty"],
            order_index=i,
        )
        db.add(c)
        db.flush()
        stored.append({"id": c.id, "title": c.title})
    profile = user.profile
    sessions = build_schedule(
        stored,
        plan.deadline_days,
        profile.session_minutes if profile else 30,
        profile.revision if profile else "Before exams",
    )
    for s in sessions:
        db.add(
            PlanSession(
                plan_id=plan.id,
                day_number=s["day_number"],
                title=s["title"],
                minutes=s["minutes"],
                kind=s["kind"],
                concept_ids_json=dump_ids(s["concept_ids"]),
            )
        )
    db.commit()
    db.refresh(plan)
    return serialize_plan(plan)


@router.get("/{plan_id}")
def get_plan(plan_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    plan = db.get(StudyPlan, plan_id)
    if not plan or plan.user_id != user.id:
        raise HTTPException(404, "Plan not found")
    return serialize_plan(plan)


@router.get("/{plan_id}/concepts/{concept_id}/explain")
def explain(
    plan_id: int,
    concept_id: int,
    language: str = "en",
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    concept = db.get(Concept, concept_id)
    if not concept or concept.plan_id != plan_id or concept.plan.user_id != user.id:
        raise HTTPException(404, "Concept not found")
    order = json.loads(user.profile.explanation_order_json) if user.profile else ["simple", "example"]
    idx = min(concept.explanation_index, len(order) - 1)
    mode = order[idx]
    lang = language or user.preferred_language
    payload = explanations_for(
        {
            "title": concept.title,
            "source_excerpt": concept.source_excerpt,
            "summary": concept.summary,
        },
        lang,
        mode,
    )
    payload["attempt"] = concept.attempts
    payload["explanation_index"] = idx
    payload["modes"] = order
    payload["questions"] = generate_questions(
        {"title": concept.title}, concept.attempts
    )
    return payload


@router.post("/{plan_id}/concepts/{concept_id}/explain-again")
def explain_again(
    plan_id: int,
    concept_id: int,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    concept = db.get(Concept, concept_id)
    if not concept or concept.plan_id != plan_id or concept.plan.user_id != user.id:
        raise HTTPException(404, "Concept not found")
    order = json.loads(user.profile.explanation_order_json) if user.profile else ["simple"]
    concept.explanation_index = min(concept.explanation_index + 1, len(order) - 1)
    db.commit()
    return explain(plan_id, concept_id, user.preferred_language, user, db)


from pydantic import BaseModel


class SubmitBody(BaseModel):
    mcq: dict
    own_words: str = ""


@router.post("/{plan_id}/concepts/{concept_id}/check")
def check_understanding(
    plan_id: int,
    concept_id: int,
    body: SubmitBody,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    concept = db.get(Concept, concept_id)
    if not concept or concept.plan_id != plan_id or concept.plan.user_id != user.id:
        raise HTTPException(404, "Concept not found")
    questions = generate_questions({"title": concept.title}, concept.attempts)
    correct = 0
    total = 0
    for q in questions:
        if q["kind"] != "mcq":
            continue
        total += 1
        if body.mcq.get(q["id"]) == q["answer"]:
            correct += 1
    own = score_own_words(body.own_words, concept.title)
    score = (correct / total) * 0.7 + own * 0.3 if total else own
    concept.attempts += 1
    concept.last_score = round(score, 3)
    understood = score >= 0.7
    concept.understood = understood
    if understood:
        user.xp += 20
        if score >= 0.9:
            _award(db, user, "concept-master")
        if concept.attempts >= 2:
            _award(db, user, "deep-learner")
    else:
        order = json.loads(user.profile.explanation_order_json) if user.profile else ["simple"]
        concept.explanation_index = min(concept.explanation_index + 1, len(order) - 1)
    _maybe_level(user)
    plan = concept.plan
    if plan.concepts and all(c.understood for c in plan.concepts):
        plan.status = "completed"
        user.xp += 50
        _award(db, user, "starter")
        completed = db.query(StudyPlan).filter(StudyPlan.user_id == user.id, StudyPlan.status == "completed").count()
        if completed >= 3:
            _award(db, user, "consistency")
        if completed >= 10:
            _award(db, user, "knowledge-master")
        _award(db, user, "fast-learner")
    db.commit()
    return {
        "score": concept.last_score,
        "understood": understood,
        "message": "Concept understood"
        if understood
        else "Let's try another explanation. We do not move on until this clicks.",
        "xp": user.xp,
        "level": user.level,
    }


@router.get("/{plan_id}/notes.pdf")
def notes_pdf(plan_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    plan = db.get(StudyPlan, plan_id)
    if not plan or plan.user_id != user.id:
        raise HTTPException(404, "Plan not found")
    pdf = build_notes_pdf(
        plan.title,
        [{"title": c.title, "summary": c.summary} for c in plan.concepts],
        ["Skipping the 'does this magnitude make sense?' check."],
    )
    return Response(content=pdf, media_type="application/pdf")
