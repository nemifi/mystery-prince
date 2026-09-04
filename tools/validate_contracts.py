#!/usr/bin/env python3
"""Validate MYSTERY PRINCE prototype contracts and realizations.

This is development tooling, not a platform/runtime language commitment.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Iterable

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def schema_errors(instance: dict[str, Any], schema: dict[str, Any], label: str) -> list[str]:
    validator = Draft202012Validator(schema)
    out: list[str] = []
    for error in sorted(validator.iter_errors(instance), key=lambda e: list(e.absolute_path)):
        where = ".".join(str(p) for p in error.absolute_path) or "<root>"
        out.append(f"{label}: schema error at {where}: {error.message}")
    return out


def duplicates(values: Iterable[str]) -> set[str]:
    seen: set[str] = set()
    dup: set[str] = set()
    for value in values:
        if value in seen:
            dup.add(value)
        seen.add(value)
    return dup


def check_refs(label: str, refs: Iterable[str], valid: set[str], kind: str) -> list[str]:
    return [f"{label}: unknown {kind} reference: {ref}" for ref in refs if ref not in valid]


def validate_princes() -> tuple[set[str], list[str]]:
    schema = load_json(ROOT / "schemas" / "prince-core-v0.1.schema.json")
    errors: list[str] = []
    prince_ids: set[str] = set()

    for path in sorted((ROOT / "examples" / "princes").glob("*.json")):
        data = load_json(path)
        label = str(path.relative_to(ROOT))
        errors.extend(schema_errors(data, schema, label))
        pid = data.get("id")
        if isinstance(pid, str):
            if pid in prince_ids:
                errors.append(f"{label}: duplicate PRINCE id across fixtures: {pid}")
            prince_ids.add(pid)

    return prince_ids, errors


def reachable_state(data: dict[str, Any]) -> tuple[set[str], set[str]]:
    known: set[str] = set()
    for item in data.get("knowledge", []):
        if item.get("holder") == "player:initial":
            known.update(item.get("fact_ids", []))

    completed: set[str] = set()
    opportunities = data.get("opportunities", [])

    changed = True
    while changed:
        changed = False
        for op in opportunities:
            oid = op.get("id")
            if not isinstance(oid, str) or oid in completed:
                continue
            req = set(op.get("requires_fact_ids", []))
            if req.issubset(known):
                completed.add(oid)
                known.update(op.get("reveals_fact_ids", []))
                changed = True

    return known, completed


def validate_experience(path: Path, prince_ids: set[str]) -> list[str]:
    schema = load_json(ROOT / "schemas" / "experience-contract-v0.1.schema.json")
    data = load_json(path)
    label = str(path.relative_to(ROOT))
    errors = schema_errors(data, schema, label)

    castings = data.get("castings", [])
    facts = data.get("facts", [])
    relations = data.get("relations", [])
    opportunities = data.get("opportunities", [])
    conditions = data.get("completion_conditions", [])

    casting_ids = {x.get("id") for x in castings if isinstance(x.get("id"), str)}
    fact_ids = {x.get("id") for x in facts if isinstance(x.get("id"), str)}
    relation_ids = {x.get("id") for x in relations if isinstance(x.get("id"), str)}
    opportunity_ids = {x.get("id") for x in opportunities if isinstance(x.get("id"), str)}
    condition_ids = {x.get("id") for x in conditions if isinstance(x.get("id"), str)}

    for name, items in [
        ("casting", [x.get("id") for x in castings]),
        ("fact", [x.get("id") for x in facts]),
        ("relation", [x.get("id") for x in relations]),
        ("opportunity", [x.get("id") for x in opportunities]),
        ("completion condition", [x.get("id") for x in conditions]),
    ]:
        vals = [x for x in items if isinstance(x, str)]
        for dup in sorted(duplicates(vals)):
            errors.append(f"{label}: duplicate {name} id: {dup}")

    for casting in castings:
        pid = casting.get("prince_id")
        if isinstance(pid, str) and prince_ids and pid not in prince_ids:
            errors.append(f"{label}: CASTING references unknown PRINCE: {pid}")

    for k in data.get("knowledge", []):
        errors.extend(check_refs(label, k.get("fact_ids", []), fact_ids, "fact"))

    declared_caps = set(data.get("capabilities", {}).get("required", [])) | set(
        data.get("capabilities", {}).get("optional", [])
    )

    valid_relation_endpoints = fact_ids | casting_ids | opportunity_ids
    for relation in relations:
        for field in ("from", "to"):
            ref = relation.get(field)
            if isinstance(ref, str) and ref not in valid_relation_endpoints:
                errors.append(f"{label}: relation {relation.get('id')} has unknown endpoint {ref}")

    for op in opportunities:
        oid = op.get("id", "<unknown>")
        errors.extend(check_refs(label, op.get("requires_fact_ids", []), fact_ids, "fact"))
        errors.extend(check_refs(label, op.get("reveals_fact_ids", []), fact_ids, "fact"))
        capability = op.get("capability")
        if isinstance(capability, str) and capability not in declared_caps:
            errors.append(f"{label}: opportunity {oid} uses undeclared capability: {capability}")
        targets = set(op.get("targets", []))
        success_targets = set(op.get("success_target_ids", []))
        if not success_targets.issubset(targets):
            errors.append(f"{label}: opportunity {oid} has success_target_ids outside targets")

    for condition in conditions:
        errors.extend(check_refs(label, condition.get("required_fact_ids", []), fact_ids, "fact"))
        errors.extend(
            check_refs(label, condition.get("required_opportunity_ids", []), opportunity_ids, "opportunity")
        )

    reachable_facts, reachable_ops = reachable_state(data)
    for condition in conditions:
        cid = condition.get("id", "<unknown>")
        missing_facts = set(condition.get("required_fact_ids", [])) - reachable_facts
        missing_ops = set(condition.get("required_opportunity_ids", [])) - reachable_ops
        if missing_facts:
            errors.append(f"{label}: completion {cid} has unreachable facts: {sorted(missing_facts)}")
        if missing_ops:
            errors.append(f"{label}: completion {cid} has unreachable opportunities: {sorted(missing_ops)}")

    _ = relation_ids, condition_ids  # reserved for stronger validators
    return errors


def validate_realization(path: Path) -> list[str]:
    schema = load_json(ROOT / "schemas" / "realization-v1.schema.json")
    data = load_json(path)
    label = str(path.relative_to(ROOT))
    errors = schema_errors(data, schema, label)

    fact_ids = {x.get("id") for x in data.get("facts", []) if isinstance(x.get("id"), str)}
    action_ids = {x.get("id") for x in data.get("actions", []) if isinstance(x.get("id"), str)}

    errors.extend(check_refs(label, data.get("initial_known_fact_ids", []), fact_ids, "fact"))

    for action in data.get("actions", []):
        aid = action.get("id", "<unknown>")
        errors.extend(check_refs(label, action.get("requires_fact_ids", []), fact_ids, "fact"))
        errors.extend(check_refs(label, action.get("reveals_fact_ids", []), fact_ids, "fact"))
        targets = set(action.get("targets", []))
        success_targets = set(action.get("success_target_ids", []))
        if not success_targets.issubset(targets):
            errors.append(f"{label}: action {aid} has success_target_ids outside targets")

    for condition in data.get("completion_conditions", []):
        errors.extend(check_refs(label, condition.get("required_fact_ids", []), fact_ids, "fact"))
        errors.extend(check_refs(label, condition.get("required_action_ids", []), action_ids, "action"))

    # Reachability for compiled packages.
    known = set(data.get("initial_known_fact_ids", []))
    completed: set[str] = set()
    changed = True
    while changed:
        changed = False
        for action in data.get("actions", []):
            aid = action.get("id")
            if not isinstance(aid, str) or aid in completed:
                continue
            if set(action.get("requires_fact_ids", [])).issubset(known):
                completed.add(aid)
                known.update(action.get("reveals_fact_ids", []))
                changed = True

    for condition in data.get("completion_conditions", []):
        cid = condition.get("id", "<unknown>")
        missing_facts = set(condition.get("required_fact_ids", [])) - known
        missing_actions = set(condition.get("required_action_ids", [])) - completed
        if missing_facts:
            errors.append(f"{label}: completion {cid} has unreachable facts: {sorted(missing_facts)}")
        if missing_actions:
            errors.append(f"{label}: completion {cid} has unreachable actions: {sorted(missing_actions)}")

    return errors


def main() -> int:
    all_errors: list[str] = []

    prince_ids, errors = validate_princes()
    all_errors.extend(errors)

    experience_paths = sorted((ROOT / "examples" / "experiences").glob("*.json"))
    realization_paths = sorted((ROOT / "examples" / "realizations").glob("*.json"))

    if not experience_paths:
        all_errors.append("No EXPERIENCE fixtures found")
    if not realization_paths:
        all_errors.append("No REALIZATION fixtures found")

    for path in experience_paths:
        all_errors.extend(validate_experience(path, prince_ids))
    for path in realization_paths:
        all_errors.extend(validate_realization(path))

    if all_errors:
        print("Validation failed:")
        for error in all_errors:
            print(f"- {error}")
        return 1

    print(
        f"OK: {len(prince_ids)} PRINCES, {len(experience_paths)} EXPERIENCES, "
        f"{len(realization_paths)} REALIZATIONS validated"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
