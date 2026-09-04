# Wave 1 Launch Checklist

Status: READY EXCEPT ONE-TIME GITHUB PAGES ENABLEMENT

## Build status

Already true:

- Experience Contract / compiler / Runtime harness CI passes.
- Both user-facing slices are ~11 minutes by static pacing diagnostic.
- A/B order is counterbalanced and participant-scoped.
- Each participant uses an isolated localStorage namespace via `?pid=P###`.
- `?reset=1` resets only that participant.
- A and B use distinct ROLE-specific portraits for REI / MINATO / KAI.
- Wave 1 build is blind before the first debrief.
- Debrief is two-stage: spontaneous blind response first, hypothesis reveal second.
- Exported JSON contains participant ID, assigned order, play log, and both debrief stages.
- Result aggregation and link-generation tools have CI self-tests.
- 20 balanced participant links are prepared in `ops/wave1-participant-links.csv`.

## Only deployment blocker

GitHub Pages is not enabled for this repository yet. The deployment workflow fails at `actions/configure-pages` before artifact upload.

One-time repository setting required:

1. Open repository **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. Re-run the `Deploy concept prototype` workflow, or push a harmless prototype change.

Expected public root after successful deployment:

```text
https://nemifi.github.io/mystery-prince/
```

Do not distribute participant URLs until this root has been opened successfully in a private/incognito browser.

## Smoke test after Pages is enabled

Use a non-participant smoke ID:

```text
https://nemifi.github.io/mystery-prince/?pid=P000&order=AB&reset=1
```

Verify:

1. Only CASE A is initially available.
2. ROLE-specific A portraits load.
3. A can reach reasoning and deliberate accusation.
4. After completion, CASE B becomes available.
5. ROLE-specific B portraits visibly differ from A while keeping recognizable identities.
6. B can reach reasoning and deliberate accusation.
7. Blind debrief appears before the star-system explanation.
8. After saving the blind answer, the reveal pause appears.
9. Revealed debrief appears only after continuing.
10. Export filename contains `P000-AB` and JSON contains `participant_id`, `assigned_order`, `play_log`, and nested `debrief`.
11. Re-open with `reset=1`; only P000 data is cleared.

## Participant allocation

Wave 1 prepared allocation:

- 20 participant IDs: P001–P020
- 10 AB
- 10 BA
- fixed seed: `20260904`

Regenerate if needed:

```bash
python tools/generate_wave1_links.py \
  --base-url https://nemifi.github.io/mystery-prince/ \
  --count 20 \
  --seed 20260904 \
  --output ops/wave1-participant-links.csv
```

The checked-in CSV is operational metadata only and contains no participant names or contact information.

## Recruitment release condition

Recruit/distribute only after:

- public smoke test passes;
- no missing image/network asset is visible;
- no hypothesis-revealing language appears before blind response;
- one internal timed AB run and one BA run both complete without facilitator rescue;
- the exact build is frozen for the wave.

## During Wave 1

For each participant:

1. Give only their assigned URL.
2. Do not explain the recurring-PRINCE hypothesis.
3. Let them finish both cases.
4. Have them save the blind response.
5. Before reveal, collect open-ended interview comments if facilitated.
6. Continue to the revealed questionnaire.
7. Export the JSON and store it outside the repository.

Do not rewrite content mid-wave unless there is a blocking defect.

## Analysis

Put anonymous exports in a local `test-results/` directory and run:

```bash
python tools/analyze_concept_tests.py test-results/ \
  --json-output build/concept-test-summary.json
```

Interpret with `docs/32-concept-test-analysis-and-gates.md`.

## Explicit stop rule

Do not proceed to commercial UI, monetization, collection/gacha, or large-scale content production because the prototype looks polished. Proceed only if Wave 1 evidence supports the distinctive H1/H2 format.
