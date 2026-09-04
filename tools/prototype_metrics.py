#!/usr/bin/env python3
"""Print rough pacing diagnostics for disposable concept-test slices.

This is deliberately a heuristic, not a quality gate. Human timed runs remain authoritative.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = ROOT / "prototype" / "content"

TEXT_KEYS = ("premise", "title", "text", "quote", "label", "feedback", "wrongFeedback")


def text_chars(value):
    if isinstance(value, str):
        return len("".join(value.split()))
    if isinstance(value, list):
        return sum(text_chars(v) for v in value)
    if isinstance(value, dict):
        return sum(text_chars(value.get(k, "")) for k in TEXT_KEYS) + sum(
            text_chars(v) for k, v in value.items() if k not in TEXT_KEYS and k in {"options", "addEvidence"}
        )
    return 0


def main():
    for path in sorted(CONTENT_DIR.glob("*.json")):
        data = json.loads(path.read_text())
        events = data["events"]
        chars = text_chars({"premise": data.get("premise", ""), "options": events})
        decision_events = sum(e.get("type") in {"choice", "reasoning", "accuse"} for e in events)
        dialogue_events = sum(e.get("type") == "dialogue" for e in events)
        evidence_items = sum(len(e.get("addEvidence", [])) for e in events)

        # Diagnostic assumption only: ~420 Japanese non-whitespace chars/minute,
        # plus basic tap/reading transition time and extra deliberation on decisions.
        reading_minutes = chars / 420
        interaction_minutes = len(events) * 0.07 + decision_events * 0.28
        estimate = reading_minutes + interaction_minutes

        print(f"{path.name}")
        print(f"  events={len(events)} dialogue={dialogue_events} decisions={decision_events} evidence={evidence_items}")
        print(f"  text_chars={chars}")
        print(f"  rough_minutes={estimate:.1f} (diagnostic only; timed human run is authoritative)")


if __name__ == "__main__":
    main()
