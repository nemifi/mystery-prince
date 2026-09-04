#!/usr/bin/env python3
"""Compile Experience Contract v0.1 fixtures into disposable Realization v1 packages.

This compiler is development tooling. Its implementation language and Realization-v1
shape are not platform-level commitments.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def realization_id(experience_id: str) -> str:
    if experience_id.startswith("exp_"):
        return f"realization_{experience_id[4:]}_v1"
    return f"realization_{experience_id}_v1"


def display_fact(fact: dict[str, Any]) -> str:
    proposition = str(fact["proposition"])
    truth_value = fact.get("truth_value")
    if truth_value == "true":
        return proposition
    if truth_value == "false":
        return f"Disproved: {proposition}"
    return f"Uncertain: {proposition}"


def compile_contract(data: dict[str, Any]) -> dict[str, Any]:
    exp = data["experience"]

    initial_known: list[str] = []
    for item in data.get("knowledge", []):
        if item.get("holder") == "player:initial":
            for fact_id in item.get("fact_ids", []):
                if fact_id not in initial_known:
                    initial_known.append(fact_id)

    actions: list[dict[str, Any]] = []
    for op in data.get("opportunities", []):
        compiled: dict[str, Any] = {
            "id": op["id"],
            "capability": op["capability"],
            "label": op.get("description") or op["capability"],
            "targets": list(op.get("targets", [])),
            "requires_fact_ids": list(op.get("requires_fact_ids", [])),
            "reveals_fact_ids": list(op.get("reveals_fact_ids", [])),
        }
        if "success_target_ids" in op:
            compiled["success_target_ids"] = list(op["success_target_ids"])
        actions.append(compiled)

    conditions = [
        {
            "id": c["id"],
            "description": c["description"],
            "required_fact_ids": list(c.get("required_fact_ids", [])),
            "required_action_ids": list(c.get("required_opportunity_ids", [])),
        }
        for c in data.get("completion_conditions", [])
    ]

    return {
        "realization_version": "1",
        "id": realization_id(exp["id"]),
        "source_experience_id": exp["id"],
        "title": exp["title"],
        "premise": exp["premise"],
        "cast": [
            {
                "casting_id": casting["id"],
                "prince_id": casting["prince_id"],
                "role_label": casting["role"]["label"],
            }
            for casting in data.get("castings", [])
        ],
        "facts": [
            {"id": fact["id"], "text": display_fact(fact)}
            for fact in data.get("facts", [])
        ],
        "initial_known_fact_ids": initial_known,
        "actions": actions,
        "completion_conditions": conditions,
    }


def validate_realization(data: dict[str, Any], label: str) -> list[str]:
    schema = load_json(ROOT / "schemas" / "realization-v1.schema.json")
    validator = Draft202012Validator(schema)
    errors: list[str] = []
    for error in sorted(validator.iter_errors(data), key=lambda e: list(e.absolute_path)):
        where = ".".join(str(p) for p in error.absolute_path) or "<root>"
        errors.append(f"{label}: {where}: {error.message}")
    return errors


def output_name(input_path: Path) -> str:
    name = input_path.name
    if name.endswith(".v0.1.json"):
        return name[: -len(".v0.1.json")] + ".realization-v1.json"
    return input_path.stem + ".realization-v1.json"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("inputs", nargs="*", type=Path)
    parser.add_argument("--write-dir", type=Path)
    args = parser.parse_args()

    inputs = args.inputs or sorted((ROOT / "examples" / "experiences").glob("*.json"))
    if not inputs:
        print("No Experience Contract inputs found")
        return 1

    if args.write_dir:
        args.write_dir.mkdir(parents=True, exist_ok=True)

    failed = False
    for input_path in inputs:
        data = load_json(input_path)
        compiled = compile_contract(data)
        errors = validate_realization(compiled, str(input_path))
        if errors:
            failed = True
            for error in errors:
                print(f"ERROR: {error}")
            continue

        if args.write_dir:
            output_path = args.write_dir / output_name(input_path)
            output_path.write_text(
                json.dumps(compiled, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(f"COMPILED: {input_path} -> {output_path}")
        else:
            print(f"OK: {input_path}")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
