# Concept-Test Presentation Shell

Status: WORKING / DISPOSABLE

## Purpose

Create the smallest polished presentation layer that lets target users experience the two H1/H2 vertical slices without implying that this is the final MYSTERY PRINCE commercial UI.

The shell exists to test the product format, not to answer the long-term UI question.

## Principle

The shell should make four things clear and attractive:

1. who the current PRINCES are,
2. what is happening in the current EXPERIENCE,
3. what meaningful choice or inference the player can make now,
4. how the PRINCES react when the player discovers or challenges something.

Everything else is secondary.

## Minimal surfaces

### 1. EXPERIENCE OPEN

Show:

- work title
- one-line premise/hook
- current-world key art/background
- the three current ROLE portraits with ROLE labels

Do not explain continuity or the star system inside the fiction.

For the second slice, recognition should come from seeing the same REI / MINATO / KAI identities in radically different clothing/ROLE presentation.

### 2. STORY / CHARACTER MOMENT

Primary presentation surface for dialogue and event progression.

Must support:

- background/scene image
- one focused PRINCE at a time
- character expression change
- short dialogue/narration blocks
- optional compact evidence/information reveal

Avoid long uninterrupted prose. Every 30–60 seconds should introduce either a character beat, new mystery information, or a player decision.

### 3. MEANINGFUL ACTION

The player occasionally chooses an action/inference such as:

- inspect a specific information source
- ask/challenge a PRINCE
- choose which hypothesis fits
- select the person to accuse

The shell does not need open-world exploration or reusable commercial mini-games.

The test only requires enough agency for the player to feel: **"I noticed / decided / accused this."**

### 4. REASONING MOMENT

At the central reversal, the player must perform one genuine inference rather than receive exposition.

Slice A:

> 23:30 is delivery time, not necessarily recording time.

Slice B:

> the replica already existed before departure, so the tunnel is a false crime window.

The temporary representation may be a small multiple-choice or evidence-selection interaction. The specific control is disposable.

### 5. ACCUSATION

The player explicitly selects the culprit and confirms the core reason.

The story must not auto-solve immediately before this point.

Character reaction follows the player's accusation so the reasoning payoff and character payoff are fused.

## Visual priority

Because H1 is a character-identity test, the presentation quality hierarchy should be:

1. PRINCE face / silhouette / expression consistency
2. ROLE-specific costume contrast between works
3. clean readable dialogue presentation
4. key evidence visuals needed for fair reasoning
5. world/background atmosphere
6. secondary UI decoration

Do not spend prototype budget on elaborate navigation, collection screens, shops, progression, account systems, or a polished home screen.

## Audio priority

Voice is valuable if inexpensive enough because it strengthens identity across ROLE changes. However voice must not become a blocker for the first test.

Preferred order:

- stable vocal direction per PRINCE
- a few high-impact voiced lines per slice
- text for the remainder

If voice is unavailable, speech rhythm and wording must carry identity.

## Test ordering

Use counterbalanced exposure when possible:

- Group 1: A -> B
- Group 2: B -> A

This helps distinguish "second appearance recognition" from one work simply being stronger.

Do not explain the intended hypothesis before both slices are complete.

## Disposable implementation

The fastest implementation may be a small web app, slideshow-like interactive prototype, or other lightweight renderer.

Requirements:

- same renderer for both slices
- content loaded from data rather than hard-coded per work when practical
- easy replacement of character art / dialogue / evidence
- event logging for major choices and completion

Non-requirements:

- production architecture
- final mobile framework
- final navigation
- monetization
- runtime LLM
- generalized future capability system

## Exit condition

The shell is good enough when test users can focus on:

- the PRINCES,
- the mystery,
- their own reasoning,

without frequently commenting on prototype roughness or being confused about what to do.
