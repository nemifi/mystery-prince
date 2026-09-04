# Mystery Prince

> A platform for continuously delivering and evolving interactive mystery experiences centered on attractive male characters.

This repository is the design and prototype source of truth for **MYSTERY PRINCE / ミステリープリンス**.

## Current milestone

**Wave 1 H1/H2 target-user validation.**

The architecture proof and disposable concept-test build are ready. The only remaining operational blocker before external distribution is one-time GitHub Pages enablement for this repository.

Read in this order:

1. [Current milestone](docs/36-current-milestone.md)
2. [Wave 1 launch checklist](docs/37-wave-1-launch-checklist.md)
3. [Wave 1 runbook](docs/35-wave-1-concept-test-runbook.md)
4. [Pre-committed analysis gates](docs/32-concept-test-analysis-and-gates.md)
5. [Full design index](docs/README.md)

Prepared Wave 1 operations include:

- two ~11-minute mystery slices;
- REI / MINATO / KAI in distinct A/B ROLE visuals;
- participant-scoped test storage;
- fixed A→B / B→A counterbalancing;
- blind debrief before the recurring-character concept is revealed;
- participant JSON export;
- analysis CLI;
- P001–P020 allocation with exact 10 AB / 10 BA split.

The prepared participant URLs live in `ops/wave1-participant-links.csv` but **must not be distributed until GitHub Pages deployment and the P000 smoke test pass**.

## Platform thesis

The stable conceptual core is intentionally small:

- **PRINCE** — who is at the center of the attraction;
- **MYSTERY** — what the user wants to know, solve, expose, or understand;
- **EXPERIENCE** — how the user participates in that mystery.

Key principles:

- **MYSTERY PRINCE is a platform, not one fixed game format.**
- **PRINCE is a broad brand label, not an in-world royal status.**
- **PRINCE and ROLE are separate.** The same recurring PRINCE may play radically different professions, eras, moral positions, relationships, or culprit/investigator roles across independent works.
- **Story continuity is optional.** A persistent fictional biography or shared universe is not a platform invariant.
- **Each mystery must work as a whole entertainment work first.**
- **AI is initially an authoring/production tool, not a runtime dependency.**
- **Content meaning is independent of presentation UI.** Creation and Runtime meet through an evolving Experience Contract.
- **Future extensibility is preserved through boundaries, not speculative feature implementation.**

The desired posture remains:

> **Broad platform definition, narrow initial implementation.**

## Architecture

Five conceptual layers:

1. **Brand** — MYSTERY PRINCE, PRINCE, CROWN MASTER ZERO, brand principles
2. **Content** — EXPERIENCE, MYSTERY, STORY, WORLD, ROLE, CAST
3. **Platform** — catalog, accounts, distribution, purchases, discovery, versioning
4. **Runtime** — current and future ways to play/present an EXPERIENCE
5. **Creation** — human/AI production, asset libraries, validation, authoring tools

Implementation mental model:

> **Whole Work Design → Experience Semantic Model → Validation → Realization Compilation → Runtime Playback**

## Architecture proof

CI currently exercises:

- Experience Contract JSON Schema v0.1;
- PRINCE CORE JSON Schema v0.1;
- three prototype PRINCE Cores;
- two deliberately different MASTER WORKS using the same recurring PRINCES;
- semantic/reference/reachability validation;
- deterministic Experience → Realization-v1 compilation;
- one Runtime-v1 harness for both works;
- automatic completion of both Realizations;
- disposable user-facing prototype validation;
- blind Wave 1 build validation;
- pacing diagnostics;
- concept-test analysis self-tests;
- balanced participant-link generation self-tests.

## What is intentionally unresolved

Do not prematurely settle these before Wave 1 evidence:

- final commercial game UI;
- monetization / gacha / collection;
- daily retention systems;
- runtime generative AI;
- large-scale content generation;
- long-term character relationship systems;
- final launch character names/designs;
- CROWN MASTER ZERO's final presentation.

The next product decision should come from target-user behavior, blind comments, and test data—not more speculative architecture.

## Working brand persona

**CROWN MASTER ZERO / クラウンマスター・ゼロ** remains the working IP-level host/persona designation. It belongs to the brand layer rather than any individual mystery continuity and is not yet immutable naming.

## Status vocabulary

- **DECIDED** — current design principle; change deliberately.
- **WORKING** — current best direction; expected to evolve.
- **OPEN** — intentionally unresolved.
