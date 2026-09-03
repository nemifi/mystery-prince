# ADR-0004 — Keep Mystery Semantics Independent of Presentation UI

Status: Accepted

## Context

The product is expected to evolve over a long period. Today’s mobile UI should not determine what the content library can become.

## Decision

Store mystery meaning, facts, relations, knowledge and allowed interactions separately from the renderer that presents them.

## Consequences

- old mysteries may be re-rendered through newer interaction paradigms
- new reusable capabilities can expand future content
- schemas and capability versioning become first-class engineering concerns
