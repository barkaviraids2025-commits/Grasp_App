import json
from math import ceil


def build_schedule(concepts: list, deadline_days: int, session_minutes: int, revision: str) -> list[dict]:
    days = max(1, deadline_days)
    n = max(1, len(concepts))
    learn_days = max(1, days - (1 if days > 1 else 0))
    per_day = max(1, ceil(n / learn_days))
    sessions = []
    idx = 0
    for day in range(1, learn_days + 1):
        batch = concepts[idx : idx + per_day]
        idx += per_day
        if not batch:
            break
        ids = [c["id"] for c in batch]
        minutes = min(session_minutes * len(batch), session_minutes + 25)
        title = " · ".join(c["title"] for c in batch[:3])
        sessions.append(
            {
                "day_number": day,
                "title": f"Learn: {title}",
                "minutes": minutes,
                "kind": "learn",
                "concept_ids": ids,
            }
        )
        sessions.append(
            {
                "day_number": day,
                "title": "Understanding check",
                "minutes": 10 if session_minutes < 30 else 15,
                "kind": "check",
                "concept_ids": ids,
            }
        )

    extra_revision = revision in {"Daily", "Several times a week", "Needs frequent refresh"}
    last_day = days
    sessions.append(
        {
            "day_number": last_day,
            "title": "Spaced revision + tough concepts",
            "minutes": session_minutes,
            "kind": "revise",
            "concept_ids": [c["id"] for c in concepts],
        }
    )
    sessions.append(
        {
            "day_number": last_day,
            "title": "Final assessment",
            "minutes": 20,
            "kind": "assess",
            "concept_ids": [c["id"] for c in concepts],
        }
    )
    if extra_revision and days > 2:
        sessions.insert(
            2,
            {
                "day_number": 2,
                "title": "Quick recall of Day 1",
                "minutes": 12,
                "kind": "revise",
                "concept_ids": [c["id"] for c in concepts[:per_day]],
            },
        )
    return sessions


def dump_ids(ids: list[int]) -> str:
    return json.dumps(ids)
