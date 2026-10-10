# Proposal

## Why

The game is built on content that already exists only as JSON under `tools/` (50 questions, 51 icebreakers), plus the 4 personality types and the trait-to-type mapping that color distribution needs. Loading that content into the API is what lets participation, distribution and icebreaker selection work with real data. The API skeleton itself moved to the `api-skeleton` change; this change keeps its name but now covers the catalog only.

## What Changes

- Add a read-only Catalog bounded context in `api/src/Catalog/`, modeled in `docs/domain/catalog/model.md` (no aggregate, no domain events for the MVP).
- Add a seed command that loads the `tools/` JSON into Postgres:
  - questions and icebreakers (existing files);
  - the 4 personality type profiles (nickname, blurb, 3 trait chips) and the trait-type mapping (new JSON files).
- The seed validates the JSON with Catalog's own schema. It also cross-checks that each profile's trait chips are mapped to that profile's type.
- Expose simple named reads: `allQuestions`, `allIcebreakers`, `profileOf(type)`, `mapping`. Each consuming context makes its own selection.
- Move `PersonalityType` to the shared kernel (`SK::PersonalityType`), next to `SK::Trait`.
- Provide the trait-type mapping to color distribution through its `TraitTypeMappingProvider` port. A `CatalogTraitTypeMappingProvider` replaces the provisional mapping.
- Give color distribution the reveal copy through its `ColorExplainer` port. The static implementation reads `PersonalityTypeProfile` from Catalog, and the AI agent plugs into the same port later.

## Capabilities

### New Capabilities
- `catalog`: the read-only game content (questions with trait-tagged answers, icebreakers with themes and traits, the 4 personality type profiles, and the trait-type mapping) and how it is seeded and read.

### Modified Capabilities

## Impact

- New `Catalog` module in `api/`, following the `api-skeleton` layout.
- Reads the `tools/` JSON files as the content contract. `tools/` gains the profiles and mapping JSON, and validates all of its JSON against Catalog's schemas.
- Replaces the shared-types folder `api/src/Types/` introduced on `api-types-and-contract-gaps`.
- Depends on `api-skeleton`. Consumed by `quiz-and-answers`, `color-distribution` and `night-icebreaker`.
- Owner: Diego.
