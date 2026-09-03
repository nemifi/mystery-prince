# 04 — AI-Assisted Content Production

## Initial role of AI

### DECIDED
AI is primarily a **creation-time production system**, not a per-user real-time storyteller.

The goal is not “press generate and publish whatever comes out.”

The goal is to increase creative throughput while protecting whole-work quality.

## The quality failure to avoid

A naive system that independently generates:
- a trick
- a character secret
- some clues
- some dialogue
- a UI sequence

and then stitches them together will tend to produce coherent-looking but low-quality works.

Logical consistency alone is not enough. A mystery can be technically solvable and still be boring.

## Whole-work-first production

### DECIDED
Every work starts with an integrated **MASTER STORY** (working term).

The MASTER STORY exists before detailed scene generation or game conversion.

It should express the complete work at a high level, including at least:
- hook
- cast and roles
- central incident
- central question
- complete truth
- main reversals
- climax
- ending/aftertaste
- how each important Prince is attractive in this specific work

Exact schema is still open.

## Production direction

A likely pipeline:

1. **Concept exploration** — AI can generate many possible high-level premises.
2. **Selection** — humans/AI ranking choose promising concepts.
3. **MASTER STORY** — develop the selected concept into one coherent full work.
4. **Mystery logic** — formalize truth, timeline, information, clues, lies and solvability.
5. **Game adaptation** — translate the work into reusable interaction semantics/capabilities.
6. **Presentation production** — dialogue, asset selection, expressions, BGM/SFX, pacing.
7. **Automated checks** — consistency, accessibility of required information, state reachability, etc.
8. **Human play/edit** — judge actual entertainment quality and character appeal.
9. **Package and publish**.

## AI does not get unlimited authority

Downstream generation should not silently rewrite the established truth of the work.

Example principle:
- the MASTER STORY establishes the work
- the formal truth model establishes factual reality
- dialogue generation renders that reality
- dialogue generation cannot invent a new twin, culprit or timeline simply because it sounds dramatic

## Generate many, publish few

AI’s low marginal generation cost is most valuable when used for **optionality and selection**, not merely volume.

A strong model may be:
- generate many concepts
- develop fewer
- validate fewer
- human-play a small shortlist
- publish only works that clear the bar

The objective is not “infinite content.” It is **a high-quality catalog whose feasible supply is much larger than traditional manual production**.
