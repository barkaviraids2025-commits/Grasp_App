import json

PACE = {
    "A": "Fast",
    "B": "Moderate-fast",
    "C": "Moderate",
    "D": "Steady",
    "E": "Topic-dependent",
}

FOCUS_WINDOW = {
    "A": "Under 15 min",
    "B": "15–30 min",
    "C": "30–60 min",
    "D": "1–2 hours",
    "E": "2+ hours",
}

SESSION_MINUTES = {"A": 12, "B": 22, "C": 35, "D": 50, "E": 70}

PREFERRED = {
    "A": "Reading",
    "B": "Visual explanation",
    "C": "Practice questions",
    "D": "Real-world examples",
    "E": "Teaching / explaining",
}

DIFFICULT_HELP = {
    "A": "Step-by-step",
    "B": "Visual diagrams",
    "C": "Examples",
    "D": "Immediate practice",
    "E": "Self-exploration",
}

PROBLEM = {
    "A": "Break into parts",
    "B": "Trial & error",
    "C": "Worked examples",
    "D": "Ask for help",
    "E": "Skip when stuck",
}

RETENTION = {
    "A": "Strong",
    "B": "Moderate",
    "C": "Partial",
    "D": "Needs frequent refresh",
    "E": "Interest-dependent",
}

REVISION = {
    "A": "Daily",
    "B": "Several times a week",
    "C": "Before exams",
    "D": "When forgotten",
    "E": "Rare",
}

MOTIVATION = {
    "A": "Curiosity",
    "B": "Good marks",
    "C": "Career-oriented",
    "D": "Competition",
    "E": "Deadlines",
    "F": "Expectations",
}

BEST_TIME = {
    "A": "Early morning",
    "B": "Afternoon",
    "C": "Evening",
    "D": "Late night",
    "E": "Flexible",
}

# Order of explanation modes for adaptive loop
MODE_MAP = {
    "A": ["simple", "diagram", "example", "practice", "voice"],
    "B": ["animation", "diagram", "simple", "example", "practice"],
    "C": ["example", "practice", "simple", "diagram", "voice"],
    "D": ["example", "simple", "diagram", "practice", "voice"],
    "E": ["simple", "example", "practice", "diagram", "voice"],
}

HELP_BOOST = {
    "A": "simple",
    "B": "diagram",
    "C": "example",
    "D": "practice",
    "E": "simple",
}


def build_profile(answers: dict) -> dict:
    q3 = answers.get("q3", "C")
    q7 = answers.get("q7", "C")
    q8 = answers.get("q8", "A")
    session = SESSION_MINUTES.get(q3, 35)
    if answers.get("q4") in ("A", "B"):
        session = max(12, session - 8)

    order = list(MODE_MAP.get(q7, MODE_MAP["C"]))
    boost = HELP_BOOST.get(q8, "simple")
    if boost in order:
        order.remove(boost)
        order.insert(0, boost)

    pace = PACE.get(answers.get("q1", "C"), "Moderate")
    focus = FOCUS_WINDOW.get(q3, "30–60 min")
    preferred = f"{PREFERRED.get(q7)} + {DIFFICULT_HELP.get(q8)}"
    problem = PROBLEM.get(answers.get("q5", "B"), "Trial & error")
    retention = RETENTION.get(answers.get("q9", "B"), "Moderate")
    revision = REVISION.get(answers.get("q10", "C"), "Before exams")
    motivation = MOTIVATION.get(answers.get("q13", "C"), "Career-oriented")
    best_time = BEST_TIME.get(answers.get("q12", "C"), "Evening")

    summary = (
        f"Learning pace: {pace}. Focus window: {focus}. "
        f"Preferred path: {preferred}. Problem-solving: {problem}. "
        f"Retention: {retention}. Revision: {revision}. "
        f"Motivation: {motivation}. Best sessions: about {session} minutes "
        f"during {best_time.lower()}."
    )

    return {
        "pace": pace,
        "focus_window": focus,
        "preferred_learning": preferred,
        "problem_solving": problem,
        "retention": retention,
        "revision": revision,
        "motivation": motivation,
        "session_minutes": session,
        "best_time": best_time,
        "explanation_order": order,
        "summary": summary,
    }


def answers_json(answers: dict) -> str:
    return json.dumps(answers)


def order_json(order: list[str]) -> str:
    return json.dumps(order)
