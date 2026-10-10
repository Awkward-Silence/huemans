# ADR-012: AI may weigh answers on submit, behind a timeout and a fallback

**Status:** Proposed (2026-10-10)

## Context

The original rule was "agents enrich, they never decide or block": no LLM call in the join, answer, distribution or close paths. The "I ..." sentence builder produces free text that no catalog can map to traits, so its traits can only come from a model. The team wants the sentence to count towards the attendee's personality type, and the answer call to return the color directly.

## Decision

- On submit, Participation may ask one AI model to weigh the traits of the free-text answer. It does this through a port (`SentenceTraitWeigher`), never from the domain.
- The model is Jev (TypeSafe's System One model): one typed Choice over the 33 traits, answered in 70-500 ms with calibrated probabilities. It is called over plain HTTP. Mastra stays the home of text-generating agents, and Jev is not one.
- The call has a hard timeout (`JEV_TIMEOUT_MS`, 1.5 s by default). On a missing key, a timeout, an error status or an unexpected response, the sentence adds no traits, and the multiple-choice answers decide alone. The port never throws.
- The model only weighs evidence. It never picks the type or the color. The sentence is worth one answer in total, the same as each multiple-choice answer, so it can tip a close call but not override the quiz.
- Join, distribution and close stay free of AI calls.

## Consequences

Submitting can take up to the timeout longer. The color can depend on a model's output, so the same answers may land differently if the model changes (pin `JEV_MODEL` to a versioned id to freeze it). Assignment never fails because of the AI.

## In this repo

- Port `api/src/Participation/Domain/Port/SentenceTraitWeigher.ts`; adapter `api/src/Participation/Infrastructure/Jev/JevSentenceTraitWeigher.ts`.
- `SentenceTraits` (`api/src/Participation/Domain/ValueObject/SentenceTraits.ts`) rescales the model's probabilities to one answer's worth and drops noise below 5%.
