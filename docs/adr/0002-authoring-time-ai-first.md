# ADR-0002 — Use AI at Authoring Time First

Status: Accepted

## Context

Runtime generation creates significant API cost, latency, unpredictability and QA complexity.

## Decision

The initial product uses AI during content creation. Released mysteries are packaged, reviewed game content and do not require per-play LLM generation.

## Consequences

- predictable user experience
- easier QA and safety review
- easier high-quality visual/voice integration
- runtime generation remains a future extension rather than an MVP requirement
