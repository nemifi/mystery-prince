# Realization v1 Format

Status: WORKING

## Purpose

REALIZATION v1 is the first concrete package consumed by Runtime v1. It is intentionally disposable and runtime-specific.

EXPERIENCE should outlive this format. REALIZATION v1 should not be treated as the long-term content ontology.

## Compiler boundary

Input:

- Experience Contract v0.1
- referenced PRINCE identities / prototype metadata as needed

Output:

- one deterministic Runtime-v1 package

## Minimal package

The Runtime-v1 package contains:

- realization version and ID
- source EXPERIENCE ID
- title / premise for the harness
- cast labels
- fact display text
- initial player-known facts
- executable actions compiled from Opportunities
- completion conditions

## Action execution model

For Runtime v1 only:

1. An action is available when all `requires_fact_ids` are known and the action has not already succeeded/completed.
2. Executing a normal action reveals its `reveals_fact_ids` and marks it completed.
3. For actions with `success_target_ids`, the user selects one target from `targets`.
4. A target-match success reveals facts and marks the action completed.
5. A wrong decision does not mutate hard truth and may be retried in the harness.
6. Completion occurs only when a Completion Condition's required facts are known and required actions have succeeded.

This is a harness rule, not a permanent MYSTERY PRINCE game rule.

## Why compile instead of reading EXPERIENCE directly

The compiler is a firewall.

Runtime-v1 convenience fields such as action labels, simplified cast display, ordering hints, or later presentation metadata can exist in REALIZATION without polluting EXPERIENCE.

A future voice/3D/AI runtime may use an entirely different realization format compiled from the same semantic work.

## No per-work logic

The compiler and Runtime must not switch on EXPERIENCE IDs. Differences between Work A and Work B must emerge from data.

## Expected first proof

Compile:

- `exp_proto_001` → `realization_proto_001_v1`
- `exp_proto_002` → `realization_proto_002_v1`

and execute both through the same Runtime-v1 action evaluator.