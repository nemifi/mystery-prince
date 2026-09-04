# Wave 1 Concept Test Runbook

Status: READY EXCEPT ONE-TIME GITHUB PAGES ENABLEMENT

## Objective

Test the two distinctive assumptions before investing in a commercial UI, retention systems, monetization, or large-scale AI production:

1. recurring PRINCES can survive radical ROLE/biography changes;
2. attachment to those PRINCES makes the mystery emotionally stronger.

## Start condition

Do not recruit external participants until all are true:

- both slices pass CI;
- timed/internal runs are roughly 8–15 minutes each;
- A→B / B→A counterbalancing works;
- the user is not told the star-system hypothesis before both works;
- test exports and result analysis work;
- each PRINCE uses a distinct A-role and B-role visual realization rather than an identical portrait;
- the public test URL passes one clean smoke test.

All code/content conditions are currently met. The remaining operational blocker is the one-time GitHub Pages repository setting described in `37-wave-1-launch-checklist.md`.

## Recommended wave size

12–20 target users for the first directional wave, split reasonably between AB and BA.

The prepared operational set uses 20 IDs with an exact 10 AB / 10 BA split.

This is not a statistical launch study. The goal is to expose format failures and obtain repeated qualitative patterns.

## Participant profile

Prioritize people plausibly interested in the intended product, for example users who consume some combination of:

- character-led mobile games / visual novels;
- female-oriented character IP;
- mystery / deduction entertainment;
- anime-style character media.

Include some variation in mystery-game familiarity so the result is not only expert-puzzle feedback.

## Test flow

1. Give only the participant-specific URL (`?pid=P###&order=AB|BA`).
2. Give only a neutral instruction: play the two short mystery cases in the shown order.
3. Do not explain PRINCE/ROLE separation or ask participants to look for character continuity.
4. Let the participant play without coaching unless blocked by a prototype defect.
5. After both cases, the built-in **blind debrief** appears first. Save it before any explanation.
6. If facilitated, ask open interview questions at the reveal-pause screen.
7. Continue to reveal the recurring-PRINCE concept and complete the second-stage debrief.
8. Export the participant JSON.

The blind and revealed responses are stored separately so spontaneous recognition is not confused with agreement after explanation.

## Interview prompts at the reveal pause

Use open wording first:

- 「2本遊んで、3人についてどう感じましたか？」
- 「2本目で印象が変わった人はいましたか？」
- 「誰かを疑いたくない、信じたい、と感じた瞬間はありましたか？」
- 「もう1本あるなら誰を見たいですか？」
- 「その人をどんな立場・職業で見たいですか？」
- 「違和感や分かりづらさはどこでしたか？」

Avoid asking “同じキャラとして成立しましたか？” before spontaneous reactions have been collected.

## Facilitator notes

Record separately:

- spontaneous use of phrases like 「今回のREI」;
- spontaneous recognition that names/faces/personality carry across worlds before reveal;
- visible hesitation when a liked character becomes suspicious;
- attempts to protect/discount evidence against a preferred character;
- whether users infer that biography is reset without needing an explanation;
- whether the second ROLE feels exciting, confusing, or merely cosmetic;
- whether users discuss the mystery itself after completion.

## Participant storage

The prototype scopes local browser data by participant ID.

- `?pid=P001` isolates P001 data.
- `?reset=1` clears only that participant's stored test state.
- A participant's assigned order is also stored inside that namespace.

This allows multiple participants to use one device without mixing logs, as long as the correct participant URL is used.

## Data handling

Save exported participant JSON files in a local non-repository folder unless there is a deliberate reason to version anonymized research data.

`test-results/` is gitignored.

Aggregate with:

```bash
python tools/analyze_concept_tests.py test-results/ \
  --json-output build/concept-test-summary.json
```

Do not commit personally identifying participant data to this repository.

## Mid-wave rule

Do not rewrite story/character content after every participant. Pause and fix only if there is a genuine blocking defect (broken navigation, unreadable screen, impossible completion).

Otherwise finish a coherent small wave before interpretation. This avoids turning every participant into a different experiment.

## Review after wave

Read quantitative summaries together with interview notes. Do not call H1/H2 successful based only on revealed debrief ratings.

Specifically compare:

- blind observations vs revealed identity scores;
- blind preferred character vs revealed preferred PRINCE;
- AB vs BA groups;
- per-character identity continuity (REI / MINATO / KAI);
- mystery quality A vs B;
- emotional interference with reasoning;
- actual play duration and error patterns.

Use `docs/32-concept-test-analysis-and-gates.md` for the pre-committed interpretation bands.

## Explicit non-goals for Wave 1

Do not test:

- monetization;
- gacha/collection;
- daily retention;
- 30-minute final game pacing;
- runtime AI;
- final commercial UI;
- CROWN MASTER ZERO appeal;
- broad market sizing.

Those questions become relevant only if the distinctive format itself survives.
