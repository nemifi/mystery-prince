# Wave 1 release after the platform migration

The previous freeze belongs to the [archived implementation](../docs/archive/pre-platform/wave1-freeze.md). This release is a new study revision with no save or export compatibility.

Exact study and publication IDs are recorded in [wave1-release.json](wave1-release.json). Regenerate it with `npm run freeze:study` after building. The current assignment file has 20 participants, 10 AB and 10 BA, and uses `study`, `participant`, `cohort` parameters.

Local validation covers contracts, alternate engines, persistence, complete AB/BA browser flows, two-stage debrief, exports and analysis. Synthetic QA results are not participant evidence.

Distribution target: `https://nemifi.github.io/mystery-prince/`.

Public deployment status is unverified in this migration. Do not infer readiness from the former Pages enablement record. Before recruitment, inspect the deployed build with a dedicated QA participant and complete a human timed playthrough. The automated deployment now publishes `dist/site/`.

Current procedure and interpretation bands: [research operations](../docs/research.md).
