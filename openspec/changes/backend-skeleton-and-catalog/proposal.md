# Proposal

## Why

The game is built on content that already exists only as JSON under `tools/` (50 questions, 51 icebreakers), plus the 4 personality types and the trait-to-type mapping that color distribution needs. Loading that content into the API is what lets participation, distribution and icebreaker selection work with real data. The API skeleton itself moved to the `api-skeleton` change; this change keeps its name but now covers the catalog only.

## What Changes

- Add a Catalog bounded context in `api/src/Catalog/`.
- Add a seed command that imports `tools/src/questions/questions.test.json` and `tools/src/icebreakers/icebreakers.test.json`, validating them with the API's own schema (no runtime dependency on `tools/`).
- Define the 4 personality types (names and short descriptions shown at the reveal) and the trait-to-type mapping: each of the 33 traits belongs to exactly one personality type (see `docs/domain/color-distribution/model.md`).
- Provide the trait-type mapping to color distribution through its `TraitTypeMappingProvider` port, replacing the provisional mapping.

## Capabilities

### New Capabilities
- `catalog`: the read-only game content (questions with trait-tagged answers, icebreakers with themes and traits, the 4 personality types with descriptions, and the trait-to-type mapping) and how it is loaded.

### Modified Capabilities

## Impact

- New `Catalog` module in `api/`, following the `api-skeleton` layout.
- Reads the `tools/` JSON files as the content contract. `tools/` itself is unchanged.
- Depends on `api-skeleton`. Consumed by `event-join-and-answers`, `color-distribution` and `night-icebreaker`.
- Owner: Diego.
