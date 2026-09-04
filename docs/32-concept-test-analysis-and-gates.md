# Concept Test Analysis and Decision Gates

Status: WORKING / PRE-COMMITTED BEFORE USER DATA

## Purpose

Avoid moving the goalposts after seeing test results. The first concept test is primarily qualitative, but we still define signal bands before recruitment.

The test evaluates two product hypotheses:

- **H1 — Star-system:** recurring PRINCES remain recognizable and attractive across different ROLEs / biographies.
- **H2 — Character × Mystery:** emotional attachment changes suspicion/reasoning in a way that strengthens the mystery.

## Recommended first wave

- 12–20 target users.
- Keep A→B and B→A reasonably balanced.
- Do not explain the star-system hypothesis until both experiences are complete.
- Use the same build and art set for a wave unless a blocking usability defect requires a fix.

This sample is for directional product evidence, not statistical population claims.

## Primary signals

### H1 — identity continuity

Debrief `identity` (1–5):

- **Strong:** median/mean around 4.0+ and repeated spontaneous language such as “今回のREI” or “次の役も見たい.”
- **Mixed:** around 3.0–3.9, or one PRINCE clearly fails while others work.
- **Weak:** below ~3.0, repeated confusion, or users interpret recurring names/faces as continuity errors.

Do not accept a high identity score if the art makes the test trivial by reusing the exact same portrait/costume in both works. The two ROLE realizations must visibly differ.

### H1 — desire for recasting

Debrief `recast` (1–5) and `next_prince` / `next_role`:

- **Strong:** recast score around 4.0+, most users name a PRINCE they want to see again, and free-text role requests emerge without prompting examples doing the creative work for them.
- **Mixed:** users like the characters but prefer one fixed biography/world.
- **Weak:** “NONE” is common or users ask for conventional story continuation instead of new ROLEs.

### H2 — emotion affects reasoning

Debrief `emotion_reasoning` plus observed/logged behavior:

- **Strong:** at least roughly half explicitly report that attachment affected suspicion, and interviews contain concrete moments (“MINATOを疑いたくなかった”).
- **Mixed:** character affection is present but separate from the deduction loop.
- **Weak:** users skip/ignore character beats when reasoning, or say the mystery would be unchanged with generic characters.

A wrong accusation caused by attachment can be a positive H2 signal if the player later feels the correction was fair and satisfying.

## Guardrails

### Order effect

Always inspect AB and BA separately. A large gap (roughly one full point on a 1–5 H1 measure) is a warning that one work is teaching the intended interpretation rather than the format naturally working.

### Mystery quality

H1/H2 results are not trusted if users repeatedly report that the mystery is arbitrary, unsolvable, or obvious. Character-format validation requires an adequate mystery baseline.

### Play length

The current slices target roughly 10–15 minutes each. Automated text diagnostics are only a guardrail; timed human runs are authoritative.

- consistently <8 min: probably insufficient relationship/reasoning development;
- roughly 8–15 min: acceptable concept-test range;
- consistently >18 min: risk that fatigue contaminates the second-experience H1 test.

### Visual identity confound

Do not use the exact same character portrait in both ROLEs. H1 should test recognizable identity **through meaningful visual transformation**, not pixel identity.

Required before external testing:

- REI A costume ≠ REI B costume
- MINATO A costume ≠ MINATO B costume
- KAI A costume ≠ KAI B costume
- face/body identity remains sufficiently stable to plausibly read as the same PRINCE

## Analysis tooling

Export each tester's JSON from the prototype and place files in a local directory, then run:

```bash
python tools/analyze_concept_tests.py test-results/
```

Optional machine-readable summary:

```bash
python tools/analyze_concept_tests.py test-results/ --json-output build/concept-test-summary.json
```

The analysis reports:

- participant/completion count;
- AB/BA balance;
- identity/recast scores overall and by order;
- emotion→reasoning response rate;
- next-PRINCE counts and requested roles;
- episode duration medians;
- wrong reasoning and accusation attempts.

## Decision after wave 1

### Continue / deepen

Proceed toward a more product-like game prototype if H1 and H2 both show strong or clearly improvable signals and no major order-effect/confound explains them.

### Iterate format

If characters are loved but H1 is mixed, change the way ROLE change is framed/presented before changing the platform thesis.

If H1 works but H2 is weak, redesign mystery interactions so character knowledge, trust, lies, and accusation have mechanical consequences.

### Reconsider thesis

Revisit the star-system/platform premise if users consistently demand fixed biography continuity and experience recasting as incoherence rather than anticipation, even after presentation issues are corrected.

## Principle

The purpose of the concept test is not to prove the idea correct. It is to make the cheapest credible attempt to falsify the two assumptions on which the distinctive product depends.
