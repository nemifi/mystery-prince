# ADR-0010: Runtime v1 is a contract harness, not the product UI

Status: ACCEPTED

## Context

The project needs an executable runtime early in order to prove the Experience Contract and data-driven content model. Designing the final smartphone game interaction at the same time would prematurely bind the platform to an unvalidated UI.

## Decision

Runtime v1 exists primarily as a Contract Test Harness.

It must execute multiple EXPERIENCES through one data-driven path, expose semantic actions, maintain session state, and reach completion conditions.

It is explicitly not treated as the final commercial UX.

## Consequences

- Harness UI may be plain and developer-friendly.
- Work-specific application code is forbidden.
- Commercial interaction design is gated on H1/H2 concept validation.
- A later Runtime may replace the harness completely without changing EXPERIENCE identity.
