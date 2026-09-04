#!/usr/bin/env python3
"""Aggregate exported MYSTERY PRINCE concept-test JSON files.

Usage:
  python tools/analyze_concept_tests.py test-results/*.json
  python tools/analyze_concept_tests.py test-results --json-output build/test-summary.json
  python tools/analyze_concept_tests.py --self-test

The script intentionally uses only the Python standard library so it can be run
by editors/researchers without the product runtime stack.
"""

from __future__ import annotations

import argparse
import json
import statistics
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

EPISODE_TITLES = ("THE 23:30 MESSAGE", "THE SEALED EXPRESS")


def parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def numeric(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def first(rows: list[dict[str, Any]], event_type: str) -> dict[str, Any] | None:
    return next((row for row in rows if row.get("type") == event_type), None)


def duration_minutes(rows: list[dict[str, Any]], title: str) -> float | None:
    starts = [r for r in rows if r.get("type") == "episode_start" and r.get("title") == title]
    ends = [r for r in rows if r.get("type") == "episode_complete" and r.get("title") == title]
    if not starts or not ends:
        return None
    start = parse_time(starts[0].get("at"))
    end = parse_time(ends[-1].get("at"))
    if not start or not end or end < start:
        return None
    return round((end - start).total_seconds() / 60.0, 2)


def summarize_participant(payload: dict[str, Any], source: str) -> dict[str, Any]:
    rows = payload.get("play_log") or []
    debrief = payload.get("debrief") or {}
    assignment = first(rows, "test_assignment") or {}
    order = assignment.get("assignedOrder") or assignment.get("testOrder")
    if not order:
        order = next((r.get("testOrder") for r in rows if r.get("testOrder") in {"AB", "BA"}), None)

    completed = [r.get("title") for r in rows if r.get("type") == "episode_complete"]
    reasoning = [r for r in rows if r.get("type") == "reasoning_attempt"]
    accusations = [r for r in rows if r.get("type") == "accusation"]
    choices = [r for r in rows if r.get("type") == "choice"]

    return {
        "source": source,
        "order": order or "UNKNOWN",
        "complete": all(title in completed for title in EPISODE_TITLES),
        "completed_count": len(set(completed)),
        "identity": numeric(debrief.get("identity")),
        "recast": numeric(debrief.get("recast")),
        "emotion_reasoning": debrief.get("emotion_reasoning"),
        "next_prince": debrief.get("next_prince"),
        "next_role": debrief.get("next_role") or "",
        "duration_a": duration_minutes(rows, EPISODE_TITLES[0]),
        "duration_b": duration_minutes(rows, EPISODE_TITLES[1]),
        "reasoning_attempts": len(reasoning),
        "reasoning_wrong": sum(not bool(r.get("correct")) for r in reasoning),
        "accusation_attempts": len(accusations),
        "accusation_wrong": sum(not bool(r.get("correct")) for r in accusations),
        "choices": [{"event": r.get("eventId"), "choice": r.get("choice"), "episode": r.get("episode")} for r in choices],
    }


def mean(values: Iterable[float | None]) -> float | None:
    data = [v for v in values if v is not None]
    return round(statistics.mean(data), 2) if data else None


def median(values: Iterable[float | None]) -> float | None:
    data = [v for v in values if v is not None]
    return round(statistics.median(data), 2) if data else None


def aggregate(participants: list[dict[str, Any]]) -> dict[str, Any]:
    order_counts = Counter(p["order"] for p in participants)
    emotion_counts = Counter(p["emotion_reasoning"] or "missing" for p in participants)
    next_prince = Counter(p["next_prince"] or "missing" for p in participants)

    by_order: dict[str, Any] = {}
    for order in ("AB", "BA"):
        group = [p for p in participants if p["order"] == order]
        by_order[order] = {
            "n": len(group),
            "identity_mean": mean(p["identity"] for p in group),
            "recast_mean": mean(p["recast"] for p in group),
            "duration_a_median": median(p["duration_a"] for p in group),
            "duration_b_median": median(p["duration_b"] for p in group),
            "reasoning_wrong_mean": mean(float(p["reasoning_wrong"]) for p in group),
            "accusation_wrong_mean": mean(float(p["accusation_wrong"]) for p in group),
        }

    complete = [p for p in participants if p["complete"]]
    yes = emotion_counts.get("yes", 0)
    answered_emotion = sum(emotion_counts[k] for k in ("yes", "no", "unsure"))

    return {
        "participants": len(participants),
        "complete_participants": len(complete),
        "completion_rate": round(len(complete) / len(participants), 3) if participants else None,
        "order_counts": dict(order_counts),
        "identity_mean": mean(p["identity"] for p in participants),
        "recast_mean": mean(p["recast"] for p in participants),
        "emotion_reasoning_counts": dict(emotion_counts),
        "emotion_reasoning_yes_rate": round(yes / answered_emotion, 3) if answered_emotion else None,
        "next_prince_counts": dict(next_prince),
        "duration_a_median": median(p["duration_a"] for p in participants),
        "duration_b_median": median(p["duration_b"] for p in participants),
        "reasoning_wrong_mean": mean(float(p["reasoning_wrong"]) for p in participants),
        "accusation_wrong_mean": mean(float(p["accusation_wrong"]) for p in participants),
        "by_order": by_order,
        "open_role_requests": [p["next_role"] for p in participants if p["next_role"].strip()],
    }


def fmt(value: Any) -> str:
    return "—" if value is None else str(value)


def print_report(summary: dict[str, Any]) -> None:
    print("# MYSTERY PRINCE Concept Test Summary")
    print()
    print(f"Participants: {summary['participants']} (complete: {summary['complete_participants']}, rate: {fmt(summary['completion_rate'])})")
    print(f"Order balance: {summary['order_counts']}")
    print(f"Identity mean (1–5): {fmt(summary['identity_mean'])}")
    print(f"Recast-excitement mean (1–5): {fmt(summary['recast_mean'])}")
    print(f"Emotion affected reasoning — yes rate: {fmt(summary['emotion_reasoning_yes_rate'])}")
    print(f"Next PRINCE: {summary['next_prince_counts']}")
    print(f"Median minutes — A: {fmt(summary['duration_a_median'])}, B: {fmt(summary['duration_b_median'])}")
    print(f"Mean wrong reasoning attempts: {fmt(summary['reasoning_wrong_mean'])}")
    print(f"Mean wrong accusations: {fmt(summary['accusation_wrong_mean'])}")
    print()
    print("## Order check")
    for order, row in summary["by_order"].items():
        print(f"{order}: n={row['n']}, identity={fmt(row['identity_mean'])}, recast={fmt(row['recast_mean'])}, A min={fmt(row['duration_a_median'])}, B min={fmt(row['duration_b_median'])}")
    if summary["open_role_requests"]:
        print()
        print("## Requested future roles")
        for text in summary["open_role_requests"]:
            print(f"- {text}")


def expand_inputs(inputs: list[str]) -> list[Path]:
    paths: list[Path] = []
    for raw in inputs:
        path = Path(raw)
        if path.is_dir():
            paths.extend(sorted(path.glob("*.json")))
        elif path.is_file():
            paths.append(path)
    return paths


def self_test() -> None:
    base = "2026-09-04T10:00:00+09:00"
    samples = []
    for order, identity, recast, emotion, prince in [
        ("AB", "5", "5", "yes", "KAI"),
        ("BA", "4", "4", "no", "REI"),
    ]:
        rows = [
            {"at": base, "type": "test_assignment", "assignedOrder": order, "testOrder": order},
            {"at": "2026-09-04T10:01:00+09:00", "type": "episode_start", "title": EPISODE_TITLES[0], "testOrder": order},
            {"at": "2026-09-04T10:12:00+09:00", "type": "reasoning_attempt", "correct": False, "testOrder": order},
            {"at": "2026-09-04T10:13:00+09:00", "type": "episode_complete", "title": EPISODE_TITLES[0], "testOrder": order},
            {"at": "2026-09-04T10:14:00+09:00", "type": "episode_start", "title": EPISODE_TITLES[1], "testOrder": order},
            {"at": "2026-09-04T10:25:00+09:00", "type": "accusation", "correct": False, "testOrder": order},
            {"at": "2026-09-04T10:26:00+09:00", "type": "episode_complete", "title": EPISODE_TITLES[1], "testOrder": order},
        ]
        samples.append({"play_log": rows, "debrief": {"identity": identity, "recast": recast, "emotion_reasoning": emotion, "next_prince": prince, "next_role": "KAIを弁護士役で" if order == "AB" else ""}})
    participants = [summarize_participant(p, f"sample-{i}") for i, p in enumerate(samples)]
    result = aggregate(participants)
    assert result["participants"] == 2
    assert result["order_counts"] == {"AB": 1, "BA": 1}
    assert result["identity_mean"] == 4.5
    assert result["recast_mean"] == 4.5
    assert result["emotion_reasoning_yes_rate"] == 0.5
    assert result["duration_a_median"] == 12.0
    assert result["duration_b_median"] == 12.0
    print("OK concept-test analysis self-test")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("inputs", nargs="*", help="Exported JSON files or directories containing them")
    parser.add_argument("--json-output", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return

    paths = expand_inputs(args.inputs)
    if not paths:
        raise SystemExit("No concept-test JSON files found")

    participants = []
    for path in paths:
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            participants.append(summarize_participant(payload, str(path)))
        except (OSError, json.JSONDecodeError) as exc:
            print(f"WARN skipping {path}: {exc}")

    if not participants:
        raise SystemExit("No valid concept-test exports found")

    summary = aggregate(participants)
    print_report(summary)
    if args.json_output:
        args.json_output.parent.mkdir(parents=True, exist_ok=True)
        args.json_output.write_text(json.dumps({"summary": summary, "participants": participants}, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nWROTE {args.json_output}")


if __name__ == "__main__":
    main()
