from __future__ import annotations

import json
import math


def estimate_minutes(difficulty: str, pace: str, focus_window: int) -> int:
    base = {"easy": 25, "medium": 35, "hard": 45}.get(difficulty, 35)
    if pace in {"Steady", "Unhurried"}:
        base += 10
    if pace == "Fast":
        base -= 5
    return max(15, min(focus_window + 10, base))


def build_schedule(concepts: list[dict], deadline_days: int, profile: dict) -> list[dict]:
    days = max(1, min(int(deadline_days), 30))
    daily_cap = int(profile.get("daily_study_minutes", 90))
    focus = int(profile.get("focus_window_minutes", 40))
    break_min = int(profile.get("break_minutes", 5))
    needs_rev = bool(profile.get("needs_frequent_revision"))

    items = []
    for c in concepts:
        items.append(
            {
                "kind": "learn",
                "title": c["title"],
                "minutes": estimate_minutes(c["difficulty"], profile.get("learning_pace", "Moderate"), focus),
            }
        )
        items.append({"kind": "check", "title": f"Understanding check — {c['title']}", "minutes": 10})

    if needs_rev:
        items.append({"kind": "revise", "title": "Spaced revision of earlier ideas", "minutes": 20})

    last_day_reserve = []
    if days >= 2:
        last_day_reserve = [
            {"kind": "revise", "title": "Difficult concepts again", "minutes": min(40, focus)},
            {"kind": "assess", "title": "Final understanding check", "minutes": 20},
        ]

    learn_days = days - 1 if last_day_reserve else days
    buckets = [[] for _ in range(learn_days)]
    used = [0] * learn_days
    day_i = 0
    for item in items:
        if day_i >= learn_days:
            buckets[-1].append(item)
            continue
        if used[day_i] + item["minutes"] + break_min > daily_cap and buckets[day_i]:
            day_i += 1
            if day_i >= learn_days:
                buckets[-1].append(item)
                continue
        buckets[day_i].append(item)
        used[day_i] += item["minutes"] + break_min

    schedule = []
    for i, bucket in enumerate(buckets, start=1):
        if not bucket:
            continue
        schedule.append(
            {
                "day_number": i,
                "title": f"Day {i}",
                "items": bucket,
            }
        )
    if last_day_reserve:
        schedule.append({"day_number": days, "title": f"Day {days}", "items": last_day_reserve})
    return schedule


def session_plan(profile: dict) -> dict:
    return {
        "session_minutes": profile.get("focus_window_minutes", 40),
        "break_minutes": profile.get("break_minutes", 5),
        "sequence": profile.get("session_sequence", ["simple", "example", "practice", "check"]),
        "best_time": profile.get("best_time", "Evening"),
        "note": profile.get("tone"),
    }
