# 03 — Product and Game Model

## Session target

### WORKING
A standard mystery is approximately **30 minutes** (roughly 25–35 minutes acceptable during iteration).

Why:
- long enough for a complete mystery arc
- short enough to replay frequently
- suitable for mobile
- production scope is bounded
- catalog can grow meaningfully

## Content model

### DECIDED
Individual mysteries should normally be self-contained works with a complete resolution.

No mandatory “to be continued” dependency is needed for the core catalog.

## Current consumer promise

A working expression:

> Meet attractive men in many different roles and solve genuinely entertaining mysteries in which you cannot assume whether your favorite is ally, suspect or culprit.

## Character-first entry, mystery-grade play

The entry point may foreground:
- cast
- Prince visual
- voice actor
- role
- intriguing line

But once play begins, the mystery needs enough independent value to hold attention.

## Runtime-generation stance

### DECIDED for initial version
Do not require an LLM API for every play session.

The published work is created with AI assistance in advance, validated, edited and delivered as game data/assets.

### FUTURE POSSIBILITY
Runtime/personalized generation may become an extension if:
- cost is manageable
- latency is acceptable
- quality validation is reliable
- safety controls are reliable
- product value is clearly higher than packaged content

## Interaction and UI

### DECIDED
Do **not** freeze the project around one concrete UI yet.

Instead create a reusable interaction platform / “Mystery Device” concept whose presentation can evolve.

The Mystery Device is best thought of as a **mystery interaction OS**, not merely a fictional phone skin.

## Why a Device/OS layer helps

A shared interaction platform can support different mystery content without custom app engineering for every story.

Potential capabilities may eventually include:
- conversation
- evidence inspection
- comparison
- timeline reasoning
- location/person tracing
- reconstruction
- decoding
- accusation/deduction

These are not yet the fixed MVP feature list.

## Critical architecture constraint

### DECIDED
**New mystery content should not normally require new application code.**

New code should be required when adding a genuinely new reusable interaction capability, not when publishing each mystery.
