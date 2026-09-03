# MYSTERY PRINCE Design Documents

This directory contains the evolving product, IP, platform, content-production, and runtime architecture for MYSTERY PRINCE.

## Recommended reading order

### Start here

1. [`10-current-product-thesis.md`](10-current-product-thesis.md) — current top-level product thesis
2. [`09-platform-core-and-experience-contract.md`](09-platform-core-and-experience-contract.md) — platform core, five layers, and Experience Contract
3. [`00-vision-and-principles.md`](00-vision-and-principles.md) — original vision and core principles

### Product and IP

4. [`01-ip-and-brand-model.md`](01-ip-and-brand-model.md)
5. [`02-prince-character-model.md`](02-prince-character-model.md)
6. [`03-product-and-game-model.md`](03-product-and-game-model.md)

### Creation and runtime

7. [`04-ai-content-production.md`](04-ai-content-production.md)
8. [`05-runtime-and-architecture.md`](05-runtime-and-architecture.md)
9. [`06-mystery-data-model.md`](06-mystery-data-model.md)

### Quality and decisions

10. [`07-quality-bar-and-risks.md`](07-quality-bar-and-risks.md)
11. [`08-open-questions.md`](08-open-questions.md)
12. [`11-root-design-checklist.md`](11-root-design-checklist.md)
13. [`adr/`](adr/) — accepted architectural/product decisions

## Current design posture

The current direction can be summarized as:

> **Broad platform definition, narrow initial implementation.**

MYSTERY PRINCE is intentionally not bound to today's UI, AI capabilities, content duration, or game format. At the same time, speculative future features should not be implemented in the MVP merely to demonstrate extensibility.

The stable conceptual core is currently:

- **PRINCE**
- **MYSTERY**
- **EXPERIENCE**

Creation technology and runtime technology are expected to evolve around that core.
