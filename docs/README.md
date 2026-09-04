# MYSTERY PRINCE Design Documents

This directory contains the evolving product, IP, platform, content-production, validation, runtime, and concept-research architecture for MYSTERY PRINCE.

## Read this first

1. [`36-current-milestone.md`](36-current-milestone.md) — **current execution priority**
2. [`37-wave-1-launch-checklist.md`](37-wave-1-launch-checklist.md) — exact steps to launch Wave 1
3. [`35-wave-1-concept-test-runbook.md`](35-wave-1-concept-test-runbook.md) — test operation and facilitation
4. [`32-concept-test-analysis-and-gates.md`](32-concept-test-analysis-and-gates.md) — pre-committed interpretation bands
5. [`10-current-product-thesis.md`](10-current-product-thesis.md) — current top-level product thesis

## Platform foundation

6. [`09-platform-core-and-experience-contract.md`](09-platform-core-and-experience-contract.md) — platform core, five layers, and Experience Contract
7. [`12-domain-model.md`](12-domain-model.md) — durable objects and identity boundaries
8. [`13-experience-core-and-contract.md`](13-experience-core-and-contract.md) — EXPERIENCE identity, canon policy, and contract semantics
9. [`14-authoring-compiler-runtime-model.md`](14-authoring-compiler-runtime-model.md) — whole work → semantic model → realization → runtime
10. [`15-prince-core-minimum.md`](15-prince-core-minimum.md) — minimal portable PRINCE identity

## Concept prototype and validation

11. [`16-mvp-and-validation-plan.md`](16-mvp-and-validation-plan.md) — hypotheses and validation boundary
12. [`17-experience-contract-schema-v0.md`](17-experience-contract-schema-v0.md) — first machine-readable contract shape
13. [`18-concept-prototype-princes.md`](18-concept-prototype-princes.md) — abstract three-PRINCE test portfolio
14. [`18-prototype-prince-portfolio.md`](18-prototype-prince-portfolio.md) — concrete working identities: REI / MINATO / KAI
15. [`19-master-work-a.md`](19-master-work-a.md) — prototype work A
16. [`20-master-work-b.md`](20-master-work-b.md) — prototype work B
17. [`19-concept-test-story-beats.md`](19-concept-test-story-beats.md) — character × mystery beat design
18. [`21-runtime-v1-contract-test-harness.md`](21-runtime-v1-contract-test-harness.md) — executable architecture proof, not product UI
19. [`22-build-sequence.md`](22-build-sequence.md) — phased path from schema validation to user testing
20. [`23-realization-v1-format.md`](23-realization-v1-format.md) — disposable Runtime-v1 package format
21. [`24-concept-test-protocol.md`](24-concept-test-protocol.md) — original qualitative H1/H2 validation protocol
22. [`25-vertical-slice-spec.md`](25-vertical-slice-spec.md) — creative requirements for the two test slices
23. [`26-concept-test-presentation-shell.md`](26-concept-test-presentation-shell.md) — disposable presentation shell
24. [`27-prince-visual-identity.md`](27-prince-visual-identity.md) — cross-ROLE visual identity rules
25. [`28-character-performance-bible.md`](28-character-performance-bible.md) — REI / MINATO / KAI performance rules
26. [`29-vertical-slice-script-a.md`](29-vertical-slice-script-a.md) — expanded A script
27. [`30-vertical-slice-script-b.md`](30-vertical-slice-script-b.md) — expanded B script
28. [`31-concept-test-asset-manifest.md`](31-concept-test-asset-manifest.md) — test asset requirements

## Machine-readable fixtures and tooling

Schemas:

- [`../schemas/experience-contract-v0.1.schema.json`](../schemas/experience-contract-v0.1.schema.json)
- [`../schemas/prince-core-v0.1.schema.json`](../schemas/prince-core-v0.1.schema.json)
- [`../schemas/realization-v1.schema.json`](../schemas/realization-v1.schema.json)

Prototype and data:

- [`../prototype/`](../prototype/) — disposable Wave 1 web prototype
- [`../examples/princes/`](../examples/princes/) — stable test PRINCE IDs
- [`../examples/experiences/`](../examples/experiences/) — Experience Contract fixtures
- [`../examples/realizations/`](../examples/realizations/) — Realization v1 fixtures
- [`../ops/wave1-participant-links.csv`](../ops/wave1-participant-links.csv) — prepared P001–P020 AB/BA assignments; **do not distribute until Pages smoke test passes**

Development / research tools:

- `tools/validate_contracts.py`
- `tools/compile_realizations.py`
- `tools/runtime_v1.py`
- `tools/validate_prototype.py`
- `tools/validate_blind_concept_build.py`
- `tools/prototype_metrics.py`
- `tools/generate_wave1_links.py`
- `tools/analyze_concept_tests.py`
- `.github/workflows/validate-contracts.yml`
- `.github/workflows/deploy-prototype-pages.yml`

CI validates the semantic architecture, compiles and auto-plays both Experiences, validates the blind Wave 1 build, checks research tooling, and verifies participant-link generation.

## Earlier product and IP notes

- [`00-vision-and-principles.md`](00-vision-and-principles.md)
- [`01-ip-and-brand-model.md`](01-ip-and-brand-model.md)
- [`02-prince-character-model.md`](02-prince-character-model.md)
- [`03-product-and-game-model.md`](03-product-and-game-model.md)
- [`04-ai-content-production.md`](04-ai-content-production.md)
- [`05-runtime-and-architecture.md`](05-runtime-and-architecture.md)
- [`06-mystery-data-model.md`](06-mystery-data-model.md)
- [`07-quality-bar-and-risks.md`](07-quality-bar-and-risks.md)
- [`08-open-questions.md`](08-open-questions.md)
- [`11-root-design-checklist.md`](11-root-design-checklist.md)
- [`adr/`](adr/) — accepted architectural/product decisions

## Current posture

> **Stop expanding the speculative product until Wave 1 evidence exists.**

The architecture proof is no longer the main uncertainty. The distinctive product thesis must now survive target-user behavior: recurring PRINCES across independent ROLEs, and character emotion strengthening mystery rather than decorating it.

The only current operational blocker is one-time GitHub Pages enablement at repository level. Once Pages is enabled and P000 smoke testing passes, freeze the build and run Wave 1.
