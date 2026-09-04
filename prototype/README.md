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

## Current shell

The shell now includes:

- two playable concept-test slices using the same renderer
- REI / MINATO / KAI concept portraits
- hotel / train atmosphere art
- dialogue, information reveal, choice, deduction, and explicit accusation
- local event logging
- a short H1/H2 debrief shown after both episodes are completed
- JSON export of the play log and debrief answers via the `TEST LOG` control

The visual assets are test assets, not final launch art. `visual-overrides.css` is deliberately separate from the base shell so art direction can be replaced without changing event logic.

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

## Test logging

Major interactions are written to browser `localStorage` under:

```text
mp_concept_log
```

Debrief answers are stored under:

```text
mp_concept_debrief
```

The `TEST LOG` button downloads both as one JSON file. No server analytics are required for the first tests.

## Suggested test protocol

Where possible, counterbalance episode order:

- Group A: THE 23:30 MESSAGE → THE SEALED EXPRESS
- Group B: THE SEALED EXPRESS → THE 23:30 MESSAGE

Do not explain the star-system hypothesis before both works are complete. The useful signal is whether testers spontaneously say things like “this still feels like him,” “I like this version,” or “what role will he play next?”

## Exit condition

Do not evolve this shell into the final product by inertia. Once H1/H2 evidence is collected, keep what was learned and freely replace the presentation layer.
