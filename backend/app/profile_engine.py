from __future__ import annotations

QUESTIONS = [
    {
        "id": "q1",
        "section": "Learning Speed",
        "prompt": "When learning a completely new topic, how long do you usually need before you feel comfortable with it?",
        "options": [
            ("A", "Less than 30 minutes"),
            ("B", "30–60 minutes"),
            ("C", "1–2 hours"),
            ("D", "More than 2 hours"),
            ("E", "It depends heavily on the topic"),
        ],
    },
    {
        "id": "q2",
        "section": "Learning Speed",
        "prompt": "What do you usually do when you don't understand something?",
        "options": [
            ("A", "Try solving it myself first"),
            ("B", "Search/watch another explanation"),
            ("C", "Ask someone"),
            ("D", "Skip it and come back later"),
            ("E", "Usually leave it unfinished"),
        ],
    },
    {
        "id": "q3",
        "section": "Focus",
        "prompt": "How long can you usually study with good concentration?",
        "options": [
            ("A", "Less than 15 minutes"),
            ("B", "15–30 minutes"),
            ("C", "30–60 minutes"),
            ("D", "1–2 hours"),
            ("E", "More than 2 hours"),
        ],
    },
    {
        "id": "q4",
        "section": "Focus",
        "prompt": "How often do you get distracted while studying?",
        "options": [
            ("A", "Almost always"),
            ("B", "Often"),
            ("C", "Sometimes"),
            ("D", "Rarely"),
            ("E", "Almost never"),
        ],
    },
    {
        "id": "q5",
        "section": "Thinking & Problem Solving",
        "prompt": "When you face a difficult problem, what is your first reaction?",
        "options": [
            ("A", "Break it into smaller parts"),
            ("B", "Try different approaches"),
            ("C", "Search for a solution/example"),
            ("D", "Ask someone for help"),
            ("E", "Feel stuck and move on"),
        ],
    },
    {
        "id": "q6",
        "section": "Thinking & Problem Solving",
        "prompt": "When you make a mistake while solving something, what do you usually do?",
        "options": [
            ("A", "Analyse exactly where I went wrong"),
            ("B", "Look at the solution and try again"),
            ("C", "Ask someone to explain it"),
            ("D", "Memorize the correct approach"),
            ("E", "Move on to the next question"),
        ],
    },
    {
        "id": "q7",
        "section": "How They Learn",
        "prompt": "Which method helps you understand a topic fastest?",
        "options": [
            ("A", "Reading"),
            ("B", "Watching an explanation"),
            ("C", "Practising questions"),
            ("D", "Seeing real-world examples"),
            ("E", "Explaining it to someone else"),
        ],
    },
    {
        "id": "q8",
        "section": "How They Learn",
        "prompt": "When studying a difficult concept, what helps you most?",
        "options": [
            ("A", "Step-by-step explanation"),
            ("B", "Visual diagrams"),
            ("C", "Examples"),
            ("D", "Practising immediately"),
            ("E", "Exploring it myself"),
        ],
    },
    {
        "id": "q9",
        "section": "Memory & Revision",
        "prompt": "After learning something once, how well do you usually remember it after a few days?",
        "options": [
            ("A", "I remember most of it"),
            ("B", "I remember the main idea"),
            ("C", "I remember some parts"),
            ("D", "I forget most of it"),
            ("E", "It depends on how interesting it was"),
        ],
    },
    {
        "id": "q10",
        "section": "Memory & Revision",
        "prompt": "How often do you revise what you've studied?",
        "options": [
            ("A", "Every day"),
            ("B", "Several times a week"),
            ("C", "Before exams"),
            ("D", "Only when I forget"),
            ("E", "Almost never"),
        ],
    },
    {
        "id": "q11",
        "section": "Study Habits",
        "prompt": "How many hours do you normally study outside college/school?",
        "options": [
            ("A", "Less than 1 hour"),
            ("B", "1–2 hours"),
            ("C", "2–3 hours"),
            ("D", "3–5 hours"),
            ("E", "More than 5 hours"),
        ],
    },
    {
        "id": "q12",
        "section": "Study Habits",
        "prompt": "When do you study best?",
        "options": [
            ("A", "Early morning"),
            ("B", "Afternoon"),
            ("C", "Evening"),
            ("D", "Late night"),
            ("E", "No particular time"),
        ],
    },
    {
        "id": "q13",
        "section": "Motivation",
        "prompt": "What usually motivates you to study?",
        "options": [
            ("A", "Curiosity"),
            ("B", "Good marks"),
            ("C", "Career/job goals"),
            ("D", "Competition with others"),
            ("E", "Pressure/deadlines"),
            ("F", "Parent/teacher expectations"),
        ],
    },
    {
        "id": "q14",
        "section": "Motivation",
        "prompt": "What happens when you don't feel motivated?",
        "options": [
            ("A", "I study anyway"),
            ("B", "I take a short break and return"),
            ("C", "I switch to an easier topic"),
            ("D", "I postpone studying"),
            ("E", "I usually stop studying"),
        ],
    },
    {
        "id": "q15",
        "section": "Self-awareness",
        "prompt": "Which statement describes you best?",
        "options": [
            ("A", "I understand quickly but forget quickly."),
            ("B", "I take time to understand but remember well."),
            ("C", "I need repeated practice to understand."),
            ("D", "I understand concepts quickly when they're explained clearly."),
            ("E", "My learning varies greatly depending on the subject."),
        ],
    },
]


def build_learning_profile(answers: dict[str, str]) -> dict:
    pace_map = {
        "A": "Fast",
        "B": "Moderate",
        "C": "Steady",
        "D": "Unhurried",
        "E": "Topic-dependent",
    }
    focus_map = {
        "A": 12,
        "B": 22,
        "C": 40,
        "D": 70,
        "E": 90,
    }
    learn_map = {
        "A": "Reading",
        "B": "Visual explanation",
        "C": "Practice questions",
        "D": "Real-world examples",
        "E": "Teaching others",
    }
    solve_map = {
        "A": "Break into parts",
        "B": "Trial and error",
        "C": "Look for worked examples",
        "D": "Ask for a walkthrough",
        "E": "Needs a gentler entry",
    }
    retain_map = {
        "A": "Strong",
        "B": "Moderate",
        "C": "Patchy",
        "D": "Needs spaced review",
        "E": "Interest-linked",
    }
    revision_map = {
        "A": "Daily",
        "B": "Several times a week",
        "C": "Exam-focused",
        "D": "When forgotten",
        "E": "Rare",
    }
    hours_map = {"A": 45, "B": 90, "C": 150, "D": 240, "E": 300}
    time_map = {
        "A": "Early morning",
        "B": "Afternoon",
        "C": "Evening",
        "D": "Late night",
        "E": "Flexible",
    }
    motive_map = {
        "A": "Curiosity",
        "B": "Marks",
        "C": "Career-oriented",
        "D": "Competition",
        "E": "Deadlines",
        "F": "Expectations",
    }

    q3 = answers.get("q3", "C")
    q4 = answers.get("q4", "C")
    session = focus_map.get(q3, 40)
    if q4 in {"A", "B"}:
        session = max(15, session - 10)

    preferred = learn_map.get(answers.get("q7", "C"), "Practice questions")
    helper = {
        "A": "Step-by-step",
        "B": "Diagrams",
        "C": "Examples",
        "D": "Immediate practice",
        "E": "Self-exploration",
    }.get(answers.get("q8", "C"), "Examples")

    sequence = _session_sequence(answers.get("q7", "C"), answers.get("q8", "C"))
    break_min = 8 if q4 in {"A", "B"} else 5

    return {
        "learning_pace": pace_map.get(answers.get("q1", "B"), "Moderate"),
        "when_stuck": answers.get("q2", "A"),
        "focus_window_minutes": session,
        "distraction_frequency": answers.get("q4", "C"),
        "problem_solving": solve_map.get(answers.get("q5", "B"), "Trial and error"),
        "mistake_style": answers.get("q6", "A"),
        "preferred_learning": f"{preferred} + {helper}",
        "retention": retain_map.get(answers.get("q9", "B"), "Moderate"),
        "revision": revision_map.get(answers.get("q10", "C"), "Exam-focused"),
        "daily_study_minutes": hours_map.get(answers.get("q11", "B"), 90),
        "best_time": time_map.get(answers.get("q12", "C"), "Evening"),
        "motivation": motive_map.get(answers.get("q13", "C"), "Career-oriented"),
        "low_motivation": answers.get("q14", "B"),
        "self_pattern": answers.get("q15", "D"),
        "session_sequence": sequence,
        "break_minutes": break_min,
        "needs_frequent_revision": answers.get("q10") in {"D", "E"}
        or answers.get("q9") in {"C", "D"}
        or answers.get("q15") == "A",
        "tone": "This student's current learning pattern suggests this study approach may work better.",
        "disclaimer": "This is a study aid, not a measure of intelligence or ability. Sleep, stress, language, and prior knowledge all change how a day feels.",
    }


def _session_sequence(q7: str, q8: str) -> list[str]:
    if q7 == "B" or q8 == "B":
        return ["visual", "example", "practice", "check"]
    if q7 == "C" or q8 == "D":
        return ["simple", "example", "practice", "check"]
    if q7 == "A":
        return ["simple", "diagram", "practice", "check"]
    if q7 == "D" or q8 == "C":
        return ["example", "simple", "practice", "check"]
    if q7 == "E":
        return ["simple", "teach-back", "practice", "check"]
    return ["simple", "example", "practice", "check"]
