# Current Milestone

## Milestone: Launch and complete Wave 1 H1/H2 user validation

Architecture proof: **passed**.

Concept-test content pacing: **passed as a diagnostic** (~11 minutes per slice; human timing still authoritative).

Counterbalanced blind test flow: **implemented and CI-passing**.

Distinct A/B ROLE portraits for REI / MINATO / KAI: **implemented**.

Participant-scoped storage and reset flow: **implemented**.

Two-stage blind → revealed debrief: **implemented**.

Export + aggregation tooling: **implemented and CI-passing**.

Wave 1 participant allocation: **prepared** (P001–P020, 10 AB / 10 BA).

### Only remaining operational blocker before external Wave 1

GitHub Pages must be enabled once at repository level:

**Settings → Pages → Build and deployment → GitHub Actions**

The deployment workflow itself already exists. Previous deployment attempts failed at `actions/configure-pages` because no Pages site has been enabled for the repository.

After enabling Pages:

1. re-run `Deploy concept prototype`;
2. smoke-test with P000 using `docs/37-wave-1-launch-checklist.md`;
3. freeze the build;
4. distribute P001–P020 URLs;
5. collect anonymous JSON exports;
6. aggregate with `tools/analyze_concept_tests.py`;
7. evaluate with the pre-committed gates in `docs/32-concept-test-analysis-and-gates.md`.

### Do not return to speculative design before evidence

Do not prioritize:

- final game UI design;
- monetization design;
- large-scale content generator;
- runtime AI;
- long-term character relationship systems;
- platform feature expansion.

Those remain downstream of Wave 1 evidence. The next product decision should be driven by target-user behavior, blind comments, and debrief data—not additional architecture speculation.
