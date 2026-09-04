# Wave 1 Concept Test Runbook

Status: READY EXCEPT CROSS-ROLE ART BLOCKER

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
- **each PRINCE uses a distinct A-role and B-role visual realization** rather than an identical portrait.

The final item is the current primary blocker.

## Recommended wave size

12–20 target users for the first directional wave, split reasonably between AB and BA.

This is not a statistical launch study. The goal is to expose format failures and obtain repeated qualitative patterns.

## Participant profile

Prioritize people plausibly interested in the intended product, for example users who consume some combination of:

- character-led mobile games / visual novels;
- female-oriented character IP;
- mystery / deduction entertainment;
- anime-style character media.

Include some variation in mystery-game familiarity so the result is not only expert-puzzle feedback.

## Test flow

1. Give only a neutral instruction: play the two short mystery cases in the shown order.
2. Do not explain PRINCE/ROLE separation or ask participants to look for character continuity.
3. Let the participant play without coaching unless blocked by a prototype defect.
4. After both cases, complete the built-in debrief.
5. Ask open questions before explaining the hypothesis.
6. Export the JSON result.
7. Only then explain what is being tested and ask follow-up interpretation questions if useful.

## Interview prompts after debrief

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
- visible hesitation when a liked character becomes suspicious;
- attempts to protect/discount evidence against a preferred character;
- whether users infer that biography is reset without needing an explanation;
- whether the second ROLE feels exciting, confusing, or merely cosmetic;
- whether users discuss the mystery itself after completion.

## Data handling

Save exported participant JSON files in a local non-repository folder unless there is a deliberate reason to version anonymized research data.

Aggregate with:

```bash
python tools/analyze_concept_tests.py test-results/
```

Do not commit personally identifying participant data to this repository.

## Mid-wave rule

Do not rewrite story/character content after every participant. Pause and fix only if there is a genuine blocking defect (broken navigation, unreadable screen, impossible completion).

Otherwise finish a coherent small wave before interpretation. This avoids turning every participant into a different experiment.

## Review after wave

Read quantitative summaries together with interview notes. Do not call H1/H2 successful based only on debrief ratings.

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
