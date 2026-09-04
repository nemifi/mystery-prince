#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE_DIR = ROOT / "prototype"
CONTENT_DIR = PROTOTYPE_DIR / "content"
ASSET_DIR = PROTOTYPE_DIR / "assets"
ALLOWED_TYPES = {"open", "narration", "dialogue", "choice", "reasoning", "accuse", "end"}
REQUIRED_SHELL_FILES = {
    "index.html",
    "styles.css",
    "visual-overrides.css",
    "app.js",
    "test-tools.css",
    "test-tools.js",
}


def fail(msg):
    raise SystemExit(msg)


def require_file(path: Path):
    if not path.is_file() or path.stat().st_size <= 0:
        fail(f"Missing or empty prototype file: {path.relative_to(ROOT)}")


def validate(path: Path):
    data = json.loads(path.read_text())
    required = {"id", "title", "premise", "cast", "events"}
    missing = required - data.keys()
    if missing:
        fail(f"{path}: missing top-level keys {sorted(missing)}")

    cast_ids = {c["id"] for c in data["cast"]}
    if len(cast_ids) != len(data["cast"]):
        fail(f"{path}: duplicate cast IDs")

    for cast in data["cast"]:
        portrait = cast.get("portraitClass")
        if not portrait:
            fail(f"{path}: cast {cast.get('id')} is missing portraitClass")
        require_file(ASSET_DIR / f"{portrait}.jpg")

    scene = data.get("scene")
    if scene:
        require_file(ASSET_DIR / f"{scene}.jpg")

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
    for name in sorted(REQUIRED_SHELL_FILES):
        require_file(PROTOTYPE_DIR / name)

    paths = sorted(CONTENT_DIR.glob("*.json"))
    if not paths:
        fail("No prototype content found")
    for path in paths:
        validate(path)

    print("OK prototype shell assets/support files")


if __name__ == "__main__":
    main()
