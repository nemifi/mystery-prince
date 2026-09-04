# Build Sequence

Status: WORKING

## Principle

Build only enough infrastructure to answer the next uncertainty. Do not confuse platform completeness with validation progress.

## Milestone 0 — Root model

Status: substantially defined.

Outputs:

- platform thesis
- PRINCE / EXPERIENCE / CASTING / REALIZATION / SESSION distinction
- PRINCE CORE minimum
- whole-work-first authoring rule
- Experience Contract boundary
- initial non-goals

Exit condition: root concepts are sufficiently stable to create fixtures without defining current UI as platform identity.

## Milestone 1 — Contract fixtures

Outputs:

- Experience Contract JSON Schema v0.1
- three prototype PRINCE Cores
- two intentionally different MASTER WORKS
- two contract fixtures using the same schema

Exit condition: both works can be expressed without adding UI-specific fields or importing biography between works.

## Milestone 2 — Static validator

Build an implementation-neutral validation layer that can detect at minimum:

- schema invalidity
- duplicate IDs
- dangling references
- Opportunity prerequisites referencing missing facts
- revealed facts referencing missing facts
- completion conditions referencing missing facts
- required Capability inconsistencies
- impossible obvious dependency cycles

Later validators may add mystery-specific reasoning, but do not overbuild before real failures are observed.

Exit condition: invalid content fails before Runtime.

## Milestone 3 — Realization compiler v0

Create a deterministic transformation from Experience Contract v0.1 into a Runtime-v1 package.

The compiler owns presentation mapping for the harness, not the EXPERIENCE.

Exit condition: both prototype EXPERIENCES compile without per-work code paths.

## Milestone 4 — Runtime v1 contract harness

Build the smallest executable player for Realization v1.

Exit condition:

- both prototype works can be played to completion
- progress is data-driven
- no per-work application logic
- developer inspection explains locked/unlocked semantic actions

## Milestone 5 — Creative vertical slices

Replace placeholder copy/assets for the critical 10–15 minute H1/H2 test paths with polished character art, writing, sound, and pacing.

Important: this is where a commercial-feeling presentation may begin, but only for the small test surface.

Exit condition: the test is good enough that negative feedback is about the format rather than obviously unfinished craft.

## Milestone 6 — User validation

Test the two works sequentially with target users.

Primary questions:

- Does PRINCE identity survive ROLE/world changes?
- Does affection meaningfully interact with suspicion/reasoning?
- Does the second appearance create anticipation for future casting?

Do not optimize monetization or retention before these are understood.

## Milestone 7 — Product Runtime design

Use observed behavior to decide what the actual smartphone game should feel like.

Only now make stronger choices about:

- core interaction loop
- primary screen model
- navigation
- evidence interaction
- character interaction
- session pacing
- presentation density

The commercial Runtime may diverge substantially from the contract harness.

## Milestone 8 — AI-assisted production system

Once the target EXPERIENCE and Runtime are known, automate the highest-cost authoring steps in order of measured value.

Likely candidates:

- concept ideation / critique
- MASTER WORK expansion
- consistency checks
- semantic normalization into the contract
- dialogue drafts
- asset mapping
- automated test generation

Do not automate a bad production process merely because AI can automate it.

## Milestone 9 — Release architecture

After the format and production process survive validation, add the normal platform concerns needed for release: catalog, content versioning, distribution, analytics, purchases, operations, and other product infrastructure.

## Current next build target

Milestones 1–4 should be treated as the immediate engineering proof. Milestones 5–6 are the immediate product proof.

Everything after that depends on evidence.