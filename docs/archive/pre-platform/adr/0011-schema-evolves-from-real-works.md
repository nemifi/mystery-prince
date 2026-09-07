> Historical record from `c9984b1`. Superseded by the platform migration; this file is not a current implementation or operational instruction. See [current documentation](../../../README.md).

# ADR-0011: The Experience Contract schema evolves from real works

Status: ACCEPTED

## Context

A platform intended to survive future AI and UI changes can easily over-abstract its content model before real authoring pressure exists. A universal schema designed in advance risks either becoming meaningless or encoding speculative complexity.

## Decision

Experience Contract v0.x remains deliberately small and evolves from concrete works and observed runtime requirements.

A new durable field or capability should normally require evidence from real authoring or playback needs, preferably across more than one EXPERIENCE.

## Consequences

- Do not attempt a universal mystery ontology in v0.
- Prototype works are fixtures that test the contract.
- Schema changes are versioned and must not silently redefine existing semantics.
- Runtime-specific details remain outside the contract even if adding them would be convenient in the short term.
