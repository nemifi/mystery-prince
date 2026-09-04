# MYSTERY PRINCE Design Documents

This directory contains the evolving product, IP, platform, content-production, validation, and runtime architecture for MYSTERY PRINCE.

## Recommended reading order

### Start here

1. [`10-current-product-thesis.md`](10-current-product-thesis.md) — current top-level product thesis
2. [`09-platform-core-and-experience-contract.md`](09-platform-core-and-experience-contract.md) — platform core, five layers, and Experience Contract
3. [`12-domain-model.md`](12-domain-model.md) — durable objects and identity boundaries
4. [`13-experience-core-and-contract.md`](13-experience-core-and-contract.md) — EXPERIENCE identity, canon policy, and contract semantics
5. [`14-authoring-compiler-runtime-model.md`](14-authoring-compiler-runtime-model.md) — whole work → semantic model → realization → runtime

### Prototype architecture

6. [`15-prince-core-minimum.md`](15-prince-core-minimum.md) — minimal portable PRINCE identity
7. [`16-mvp-and-validation-plan.md`](16-mvp-and-validation-plan.md) — hypotheses and validation boundary
8. [`17-experience-contract-schema-v0.md`](17-experience-contract-schema-v0.md) — first machine-readable contract shape
9. [`18-concept-prototype-princes.md`](18-concept-prototype-princes.md) — three test PRINCE Cores
10. [`19-master-work-a.md`](19-master-work-a.md) — prototype work A
11. [`20-master-work-b.md`](20-master-work-b.md) — prototype work B
12. [`21-runtime-v1-contract-test-harness.md`](21-runtime-v1-contract-test-harness.md) — executable architecture proof, not product UI
13. [`22-build-sequence.md`](22-build-sequence.md) — phased path from schema validation to user testing

Machine-readable fixtures:

- [`../schemas/experience-contract-v0.1.schema.json`](../schemas/experience-contract-v0.1.schema.json)
- [`../examples/experiences/the-2330-message.v0.1.json`](../examples/experiences/the-2330-message.v0.1.json)
- [`../examples/experiences/the-sealed-express.v0.1.json`](../examples/experiences/the-sealed-express.v0.1.json)

### Earlier product and IP notes

14. [`00-vision-and-principles.md`](00-vision-and-principles.md)
15. [`01-ip-and-brand-model.md`](01-ip-and-brand-model.md)
16. [`02-prince-character-model.md`](02-prince-character-model.md)
17. [`03-product-and-game-model.md`](03-product-and-game-model.md)
18. [`04-ai-content-production.md`](04-ai-content-production.md)
19. [`05-runtime-and-architecture.md`](05-runtime-and-architecture.md)
20. [`06-mystery-data-model.md`](06-mystery-data-model.md)
21. [`07-quality-bar-and-risks.md`](07-quality-bar-and-risks.md)
22. [`08-open-questions.md`](08-open-questions.md)
23. [`11-root-design-checklist.md`](11-root-design-checklist.md)
24. [`adr/`](adr/) — accepted architectural/product decisions

## Current design posture

> **Broad platform definition, narrow initial implementation.**

MYSTERY PRINCE is intentionally not bound to today's UI, AI capabilities, content duration, or game format. Speculative future features should not be implemented in the MVP merely to demonstrate extensibility.

The stable conceptual core remains:

- **PRINCE**
- **MYSTERY**
- **EXPERIENCE**

The immediate proof is now concrete: represent two substantially different works with recurring PRINCES through one Experience Contract, validate them, compile them into one Runtime-v1 format, and run them without work-specific application code.
