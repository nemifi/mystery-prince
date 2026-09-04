# Concept-Test Prototype

This directory is a **disposable user-test shell**, not the commercial MYSTERY PRINCE UI.

It exists to test two product hypotheses:

- H1: the same PRINCE can remain recognizable/attractive across radically different ROLEs and fictional biographies.
- H2: attachment to a PRINCE can strengthen suspicion, deduction, and mystery payoff rather than merely decorate the story.

## Run locally

Serve the repository root over HTTP because the shell loads episode JSON with `fetch`:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/prototype/
```

## Content model

`app.js` is intentionally work-agnostic. The two slices are data:

- `content/episode-a.json` — THE 23:30 MESSAGE
- `content/episode-b.json` — THE SEALED EXPRESS

Supported temporary event types:

- `open`
- `narration`
- `dialogue`
- `choice`
- `reasoning`
- `accuse`
- `end`

These event types belong to this disposable prototype realization, not to the durable Experience Contract.

## Art

The current checked-in shell uses abstract CSS portrait placeholders so interaction work does not wait for final art.

Before external H1 testing, replace them with the cross-ROLE visual identity assets specified by `docs/27-prince-visual-identity.md`. Keep the shell's data/API boundary stable while swapping visual presentation.

## Test logging

Major interactions are written to browser `localStorage` under:

```text
mp_concept_log
```

The browser console also receives `[MP TEST]` rows. No server analytics are required for the first facilitated tests.

## Exit condition

Do not evolve this shell into the final product by inertia. Once H1/H2 evidence is collected, keep what was learned and freely replace the presentation layer.
