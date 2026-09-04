#!/usr/bin/env python3
"""Minimal Runtime v1 contract harness.

This CLI is intentionally not the commercial MYSTERY PRINCE UI. It exists to prove
that disposable Realization-v1 packages can execute without work-specific code.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class Session:
    data: dict[str, Any]
    known_fact_ids: set[str] = field(default_factory=set)
    completed_action_ids: set[str] = field(default_factory=set)

    def __post_init__(self) -> None:
        self.known_fact_ids.update(self.data.get("initial_known_fact_ids", []))
        self.facts = {f["id"]: f["text"] for f in self.data.get("facts", [])}
        self.actions = {a["id"]: a for a in self.data.get("actions", [])}

    def available_actions(self) -> list[dict[str, Any]]:
        available: list[dict[str, Any]] = []
        for action in self.data.get("actions", []):
            if action["id"] in self.completed_action_ids:
                continue
            if set(action.get("requires_fact_ids", [])).issubset(self.known_fact_ids):
                available.append(action)
        return available

    def missing_requirements(self, action: dict[str, Any]) -> set[str]:
        return set(action.get("requires_fact_ids", [])) - self.known_fact_ids

    def execute(self, action: dict[str, Any], selected_target: str | None = None) -> bool:
        if self.missing_requirements(action):
            return False

        success_targets = action.get("success_target_ids")
        if success_targets is not None:
            if selected_target not in success_targets:
                return False

        self.known_fact_ids.update(action.get("reveals_fact_ids", []))
        self.completed_action_ids.add(action["id"])
        return True

    def completed(self) -> bool:
        for condition in self.data.get("completion_conditions", []):
            if set(condition.get("required_fact_ids", [])).issubset(self.known_fact_ids) and set(
                condition.get("required_action_ids", [])
            ).issubset(self.completed_action_ids):
                return True
        return False

    def known_fact_texts(self) -> list[str]:
        return [self.facts[fid] for fid in self.facts if fid in self.known_fact_ids]


def load(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def auto_play(path: Path) -> bool:
    session = Session(load(path))
    safety = 0

    while not session.completed() and safety < 100:
        safety += 1
        available = session.available_actions()
        if not available:
            print(f"FAIL: {path}: no available actions before completion")
            return False

        progressed = False
        for action in available:
            target = None
            if action.get("success_target_ids"):
                target = action["success_target_ids"][0]
            if session.execute(action, target):
                progressed = True

        if not progressed:
            print(f"FAIL: {path}: available actions produced no progress")
            return False

    if session.completed():
        print(
            f"PASS: {path.name}: completed with {len(session.completed_action_ids)} actions "
            f"and {len(session.known_fact_ids)} known facts"
        )
        return True

    print(f"FAIL: {path}: safety limit reached")
    return False


def interactive(path: Path) -> int:
    data = load(path)
    session = Session(data)

    print(f"\n{data['title']}\n{'=' * len(data['title'])}")
    print(data["premise"])

    while not session.completed():
        print("\nKnown information:")
        for text in session.known_fact_texts():
            print(f"  - {text}")

        available = session.available_actions()
        if not available:
            print("\nNo available actions. Contract/realization may be unreachable.")
            return 1

        print("\nAvailable actions:")
        for i, action in enumerate(available, start=1):
            print(f"  {i}. [{action['capability']}] {action['label']}")

        raw = input("Select action (q to quit): ").strip()
        if raw.lower() == "q":
            return 0
        try:
            action = available[int(raw) - 1]
        except (ValueError, IndexError):
            print("Invalid selection")
            continue

        selected_target = None
        if action.get("success_target_ids") is not None:
            targets = action.get("targets", [])
            print("Choose target:")
            for i, target in enumerate(targets, start=1):
                print(f"  {i}. {target}")
            try:
                selected_target = targets[int(input("Target: ").strip()) - 1]
            except (ValueError, IndexError):
                print("Invalid target")
                continue

        before = set(session.known_fact_ids)
        if not session.execute(action, selected_target):
            print("That conclusion is not supported by the current evidence.")
            continue

        revealed = session.known_fact_ids - before
        if revealed:
            print("\nNew information:")
            for fid in revealed:
                print(f"  - {session.facts[fid]}")

    print("\nCASE COMPLETE")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+", type=Path)
    parser.add_argument("--auto", action="store_true")
    args = parser.parse_args()

    if args.auto:
        ok = all(auto_play(path) for path in args.paths)
        return 0 if ok else 1

    if len(args.paths) != 1:
        parser.error("interactive mode accepts exactly one realization path")
    return interactive(args.paths[0])


if __name__ == "__main__":
    raise SystemExit(main())
