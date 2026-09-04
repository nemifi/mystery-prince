# MYSTERY PRINCE Design Documents

This directory contains the evolving product, IP, platform, content-production, validation, and runtime architecture for MYSTERY PRINCE.

## Recommended reading order

### Start here

1. [`10-current-product-thesis.md`](10-current-product-thesis.md) — current top-level product thesis
2. [`09-platform-core-and-experience-contract.md`](09-platform-core-and-experience-contract.md) — platform core, five layers, and Experience Contract
3. [`12-domain-model.md`](12-domain-model.md) — durable objects and identity boundaries
4. [`13-experience-core-and-contract.md`](13-experience-core-and-contract.md) — EXPERIENCE identity, canon policy, and contract semantics
5. [`14-authoring-compiler-runtime-model.md`](14-authoring-compiler-runtime-model.md) — whole work → semantic model → realization → runtime

### Prototype architecture and validation

6. [`15-prince-core-minimum.md`](15-prince-core-minimum.md) — minimal portable PRINCE identity
7. [`16-mvp-and-validation-plan.md`](16-mvp-and-validation-plan.md) — hypotheses and validation boundary
8. [`17-experience-contract-schema-v0.md`](17-experience-contract-schema-v0.md) — first machine-readable contract shape
9. [`18-concept-prototype-princes.md`](18-concept-prototype-princes.md) — abstract three-PRINCE test portfolio
10. [`18-prototype-prince-portfolio.md`](18-prototype-prince-portfolio.md) — concrete working identities: REI / MINATO / KAI
11. [`19-master-work-a.md`](19-master-work-a.md) — prototype work A
12. [`20-master-work-b.md`](20-master-work-b.md) — prototype work B
13. [`19-concept-test-story-beats.md`](19-concept-test-story-beats.md) — 10–15 minute character × mystery beat design for both slices
14. [`21-runtime-v1-contract-test-harness.md`](21-runtime-v1-contract-test-harness.md) — executable architecture proof, not product UI
15. [`22-build-sequence.md`](22-build-sequence.md) — phased path from schema validation to user testing
16. [`23-realization-v1-format.md`](23-realization-v1-format.md) — disposable Runtime-v1 package format
17. [`24-concept-test-protocol.md`](24-concept-test-protocol.md) — qualitative H1/H2 validation protocol
18. [`25-vertical-slice-spec.md`](25-vertical-slice-spec.md) — creative requirements for the two H1/H2 test slices
19. [`26-concept-test-presentation-shell.md`](26-concept-test-presentation-shell.md) — minimal polished shell for user-facing concept testing
20. [`27-prince-visual-identity.md`](27-prince-visual-identity.md) — cross-ROLE visual identity rules for REI / MINATO / KAI

### Machine-readable fixtures and tooling

Schemas:

- [`../schemas/experience-contract-v0.1.schema.json`](../schemas/experience-contract-v0.1.schema.json)
- [`../schemas/prince-core-v0.1.schema.json`](../schemas/prince-core-v0.1.schema.json)
- [`../schemas/realization-v1.schema.json`](../schemas/realization-v1.schema.json)

Prototype data:

- [`../examples/princes/`](../examples/princes/) — currently named REI / MINATO / KAI while retaining stable prototype IDs
- [`../examples/experiences/the-2330-message.v0.1.json`](../examples/experiences/the-2330-message.v0.1.json)
- [`../examples/experiences/the-sealed-express.v0.1.json`](../examples/experiences/the-sealed-express.v0.1.json)
- [`../examples/realizations/`](../examples/realizations/)

Development tools:

- `tools/validate_contracts.py`
- `tools/compile_realizations.py`
- `tools/runtime_v1.py`
- `.github/workflows/validate-contracts.yml`

CI validates semantic fixtures, compiles both prototype EXPERIENCES into Realization v1, and auto-plays both through the same Runtime-v1 harness.

### Earlier product and IP notes

21. [`00-vision-and-principles.md`](00-vision-and-principles.md)
22. [`01-ip-and-brand-model.md`](01-ip-and-brand-model.md)
23. [`02-prince-character-model.md`](02-prince-character-model.md)
24. [`03-product-and-game-model.md`](03-product-and-game-model.md)
25. [`04-ai-content-production.md`](04-ai-content-production.md)
26. [`05-runtime-and-architecture.md`](05-runtime-and-architecture.md)
27. [`06-mystery-data-model.md`](06-mystery-data-model.md)
28. [`07-quality-bar-and-risks.md`](07-quality-bar-and-risks.md)
29. [`08-open-questions.md`](08-open-questions.md)
30. [`11-root-design-checklist.md`](11-root-design-checklist.md)
31. [`adr/`](adr/) — accepted architectural/product decisions

## Current design posture

> **Broad platform definition, narrow initial implementation.**

The architecture proof has passed its first automated loop. The next uncertainty is not whether the data can execute; it is whether target users actually value recurring PRINCES across radically different ROLEs and whether character emotion improves the mystery experience.

The current prototype cast is REI / MINATO / KAI, but those names and designs remain test assets rather than final launch commitments.

The commercial game UI should remain open until that evidence is collected.
