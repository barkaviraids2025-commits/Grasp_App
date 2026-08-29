from __future__ import annotations

LEVEL_STEP = 120

BADGES = {
    "starter": ("Starter", "Completed your first learning plan."),
    "consistency": ("Consistency", "Completed 3 schedules."),
    "concept_master": ("Concept Master", "Scored 90%+ on a concept check."),
    "fast_learner": ("Fast Learner", "Finished a plan inside the deadline with understanding."),
    "deep_learner": ("Deep Learner", "Mastered a concept after more than one explanation."),
    "knowledge_master": ("Knowledge Master", "Completed 10 learning plans."),
}


def level_for_xp(xp: int) -> int:
    return 1 + xp // LEVEL_STEP


def award(user, db, key: str):
    from .models import Badge

    if any(b.key == key for b in user.badges):
        return None
    name, _ = BADGES[key]
    badge = Badge(user_id=user.id, key=key, name=name)
    db.add(badge)
    user.xp += 100
    return badge


def add_xp(user, amount: int) -> None:
    user.xp += amount
