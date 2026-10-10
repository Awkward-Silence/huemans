# Proposal

## Why

The hackathon requires AI features. The places where AI makes huemans feel personal and funny (explaining *why* you got your color, why tonight's icebreaker fits this room) sit on top of the core flow. The rule is that AI enriches but never decides or blocks: the deterministic flow must work with zero LLM calls.

## What Changes

- Add an agents module in `api/` that hosts Mastra inside the NestJS process and exposes ports: `ColorExplainer` and `IcebreakerExplainer`.
- Personalized color description: after the reveal, explain the attendee's color using their own answers ("You're violet because you'd spend three hours researching plant CPR"). It arrives asynchronously after the color is shown.
- Icebreaker explanation: when the event is revealed, add a short line on why this icebreaker fits tonight's room.
- Every port has a static fallback (the catalog color description, no explanation) used on timeout or error. No LLM call sits in the join, answer, distribution or close paths.
- Stretch: an offline Mastra workflow that proposes trait-to-color weights for human review.

## Capabilities

### New Capabilities
- `ai-enrichment`: AI-generated personalized color explanations and icebreaker rationale, delivered asynchronously with deterministic fallbacks.

### Modified Capabilities

## Impact

- New dependency in `api/`: Mastra and an LLM provider key (environment variable).
- Adds optional enrichment payloads to `contracts/` (realtime push after the reveal). Clients must render correctly without them.
- Depends on `color-distribution` and `night-icebreaker`.
- Owners: Diego and Adrián, from about H12.
