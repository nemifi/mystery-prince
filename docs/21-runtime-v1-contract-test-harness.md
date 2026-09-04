# Runtime v1 — Contract Test Harness

Status: WORKING

## Purpose

Runtime v1 is not the final MYSTERY PRINCE game UI.

Its purpose is to prove that multiple meaningfully different EXPERIENCES can be represented by the same Experience Contract and played without custom engineering for each work.

Treating this harness as the commercial UX would prematurely lock the platform to a weak generic interface.

## What Runtime v1 must prove

1. Load one Experience Contract fixture.
2. Verify its required capabilities are supported.
3. Maintain player knowledge/progress state.
4. Expose currently available semantic Opportunities.
5. Execute an Opportunity and reveal its semantic consequences.
6. Reach Completion Conditions deterministically.
7. Render both prototype works without work-specific application code.

## What Runtime v1 does not need to prove

- final mobile interaction design
- final art direction
- final game feel
- free-form AI dialogue
- 3D
- sophisticated animation
- monetization
- long-term account systems
- universal support for every future EXPERIENCE

## Minimal runtime state

A SESSION needs only enough state to test the contract:

- `experience_id`
- `realization_id`
- known fact IDs
- completed opportunity IDs
- current available opportunity IDs
- completion state
- optional prototype telemetry

This state is session-level and must not mutate durable PRINCE identity.

## Runtime v1 capability set

The initial fixtures currently require a small semantic vocabulary:

- `inspect_information`
- `question_character`
- `challenge_claim`
- `form_hypothesis`
- `make_decision`

These names are provisional. They become durable only after actual playtests show the semantic distinction matters.

## Harness presentation

The simplest acceptable test presentation may contain:

- current work context
- current cast
- known information
- available semantic actions
- resulting character/narrative text
- final decision

The exact widgets are intentionally disposable.

The harness should prioritize inspectability: during development it should be possible to see why an Opportunity is locked/unlocked and which facts changed.

## Realization boundary

Runtime v1 should not consume the raw authoring document directly.

Use:

`MASTER WORK -> EXPERIENCE CONTRACT -> REALIZATION v1 -> RUNTIME v1`

The first Realization compiler may be simple or partially manual. Its existence matters because it prevents Runtime assumptions from leaking upward into EXPERIENCE.

## Success condition

Work A and Work B run through the same Runtime v1 with no conditional code such as:

- `if experience == exp_proto_001`
- hard-coded scene IDs specific to one work
- per-work screen implementation

Work-specific behavior must arrive through data.

## Product-design gate

Only after H1/H2 concept validation should the team design the commercial Runtime around observed player behavior.

The contract harness answers “Can the architecture represent and execute the work?”

The later product runtime must answer “Is this genuinely fun and desirable on a phone?”
