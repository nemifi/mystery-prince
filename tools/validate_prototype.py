#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = ROOT / "prototype" / "content"
ALLOWED_TYPES = {"open", "narration", "dialogue", "choice", "reasoning", "accuse", "end"}


def fail(msg):
    raise SystemExit(msg)


def validate(path: Path):
    data = json.loads(path.read_text())
    required = {"id", "title", "premise", "cast", "events"}
    missing = required - data.keys()
    if missing:
        fail(f"{path}: missing top-level keys {sorted(missing)}")

    cast_ids = {c["id"] for c in data["cast"]}
    if len(cast_ids) != len(data["cast"]):
        fail(f"{path}: duplicate cast IDs")

    events = data["events"]
    event_ids = [e.get("id") for e in events]
    if any(not x for x in event_ids) or len(set(event_ids)) != len(event_ids):
        fail(f"{path}: event IDs must be unique and non-empty")
    event_id_set = set(event_ids)

    has_reasoning = False
    has_accuse = False
    has_end = False

    for event in events:
        etype = event.get("type")
        if etype not in ALLOWED_TYPES:
            fail(f"{path}: unsupported event type {etype!r} in {event['id']}")

        next_id = event.get("next")
        if next_id and next_id not in event_id_set:
            fail(f"{path}: dangling next={next_id!r} in {event['id']}")

        char = event.get("character")
        if char and char not in cast_ids:
            fail(f"{path}: unknown character {char!r} in {event['id']}")

        for evidence in event.get("addEvidence", []):
            if not evidence.get("id") or not evidence.get("label"):
                fail(f"{path}: malformed evidence in {event['id']}")

        if etype in {"choice", "reasoning"}:
            options = event.get("options", [])
            if len(options) < 2:
                fail(f"{path}: {event['id']} needs at least two options")
            for option in options:
                option_next = option.get("next")
                if option_next and option_next not in event_id_set:
                    fail(f"{path}: dangling option next={option_next!r} in {event['id']}")

        if etype == "reasoning":
            has_reasoning = True
            if sum(bool(o.get("correct")) for o in event.get("options", [])) != 1:
                fail(f"{path}: reasoning {event['id']} must have exactly one correct option")

        if etype == "accuse":
            has_accuse = True
            if event.get("correct") not in cast_ids:
                fail(f"{path}: accusation correct target must be a cast ID in {event['id']}")

        if etype == "end":
            has_end = True

    if not (has_reasoning and has_accuse and has_end):
        fail(f"{path}: each slice must include reasoning, accusation, and ending")

    if events[-1].get("type") != "end":
        fail(f"{path}: final event must be end")

    print(f"OK prototype: {path.relative_to(ROOT)} ({len(events)} events)")


def main():
    paths = sorted(CONTENT_DIR.glob("*.json"))
    if not paths:
        fail("No prototype content found")
    for path in paths:
        validate(path)


if __name__ == "__main__":
    main()
