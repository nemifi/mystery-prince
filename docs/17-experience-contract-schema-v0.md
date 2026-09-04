# Experience Contract Schema v0

Status: WORKING

## Goal

Define the smallest machine-readable contract that can preserve a mystery work's semantic identity while remaining independent of today's UI, runtime technology, and AI model.

This schema is deliberately incomplete. It exists to validate the architecture against real works before being generalized.

## Design rules

1. Describe meaning, not screens.
2. Preserve EXPERIENCE identity separately from REALIZATION.
3. Keep PRINCE identity separate from work-specific ROLE.
4. Store truth explicitly enough that mystery logic can be validated.
5. Store player-facing discovery structure without encoding one concrete UI.
6. Let the runtime declare capabilities rather than letting the content name widgets.
7. Add fields only when two or more real works prove they are needed.

## Top-level structure

- `schema_version`
- `experience`
- `castings`
- `facts`
- `relations`
- `knowledge`
- `opportunities`
- `completion_conditions`
- `capabilities`
- `adaptation_policy`

## Experience core

`experience` contains the work identity:

- stable `id`
- title / working title
- premise
- player question
- dramatic spine
- truth summary
- resolution

Changing core truth, culprit/cause, central mystery, or final resolution normally creates a new EXPERIENCE rather than a new REALIZATION.

## Casting

Each CASTING links one durable `prince_id` to one work-specific ROLE.

The ROLE may define profession, age-in-work, social position, relationship, suspect/investigator/culprit function, and other biography that must not leak into PRINCE CORE.

## Facts

Facts are propositions about the work world. A fact has a stable ID and can be:

- true
- false
- uncertain

Facts may additionally be classified as hard or soft canon.

The initial schema does not attempt full formal logic. The goal is enough explicit structure to validate causality, contradiction, availability, and resolution.

## Relations

Relations connect IDs semantically. Initial relation vocabulary is open and may include:

- contradicts
- supports
- causes
- precedes
- located_at
- owns
- implies
- excludes

The vocabulary should grow from real authoring requirements rather than speculation.

## Knowledge

Knowledge records which fact IDs are known by a character or available to the player at a defined semantic state.

The initial version intentionally avoids a full agent-memory system.

## Opportunities

An Opportunity is a meaningful action that may become available. It references a semantic `capability`, targets, prerequisites, and semantic results.

Examples of capabilities might eventually include `question_character`, `inspect_information`, `challenge_claim`, `form_hypothesis`, and `make_decision`, but the platform should discover these from works rather than predefine a giant universal list.

## Completion conditions

Completion conditions express what must semantically be resolved for the EXPERIENCE to finish. They do not dictate a particular final screen.

## Adaptation policy

The contract can mark dimensions as:

- `locked` — Runtime must preserve them.
- `adaptive` — Runtime may vary them within work intent.
- `free` — Runtime owns presentation.

## Versioning principle

Schema versions evolve additively where possible. A schema change must not silently redefine existing field meaning.

The first real target is not universal expressiveness. It is this:

> Represent two substantially different prototype works using the same v0 contract without placing Runtime-v1 UI assumptions into the EXPERIENCE layer.

A draft JSON Schema lives at `schemas/experience-contract-v0.1.schema.json`.