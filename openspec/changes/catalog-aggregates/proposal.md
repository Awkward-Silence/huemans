# Proposal

## Why

The Catalog code only has a domain model on the read path: the seed, the one thing that writes, validates and stores raw zod objects, so every content rule lives in infrastructure and the read models still carry raw strings. The Catalog model was re-discovered and accepted as 2.0.0 (`docs/domain/catalog/model.md`): three aggregates authored once by the seed, free text as value objects, content frozen after a seed that runs once per database. This change brings the code in line with that model, and moves the content files out of the repo-level `tools/` package into Catalog's own infrastructure, where the seed that reads them lives.

## What Changes

- Model Catalog as three aggregates, as in `docs/domain/catalog/model.md` 2.0.0:
  - `Question` (with `Answer` entities) and `Icebreaker`, created by `author(...)`;
  - `PersonalityTypes` (the trait-type mapping and the 4 profiles), created by `define(...)`, which now owns the rule that each profile's trait chips are mapped to its own type.
- Wrap the free text in value objects: `QuestionText`, `AnswerText` and `Nickname` (not empty, at most 80 characters; a nickname is trimmed), `IcebreakerText` and `Blurb` (not empty, at most 200 characters).
- The aggregates record `QuestionAuthored`, `IcebreakerAuthored` and `PersonalityTypesDefined`; the seed dispatches them after writing. No context subscribes yet.
- **BREAKING** The seed runs once per database: the database records when it was seeded, and a second run does nothing. Re-seeding no longer updates content by key, keeps entries missing from the files, or replaces a question's answers; changing content means recreating the database (MVP).
- The seed builds every aggregate before writing anything, so any content rule it breaks rejects the whole seed and names the entry.
- **BREAKING** Move the catalog content JSON (questions, icebreakers, profiles, trait-type mapping) from `tools/src/` into `api/src/Catalog/Infrastructure/Content/`, and remove the `tools/` package. Its `validate` scripts are replaced by an `api/` command that checks the files through the aggregates without touching the database.
- Catalog's reads for other contexts (`allQuestions`, `allIcebreakers`, `profileOf`, `mapping`) keep returning the same DTOs; Color Distribution needs no change.

## Capabilities

### New Capabilities

### Modified Capabilities
- `catalog`: the seed runs once per database and goes through the aggregates (no update by key, no answer replacement, no keep-missing); the content files live in Catalog's infrastructure; content rules gain the text length limits and the nickname trimming; authoring records domain events; content can be checked without seeding.

## Impact

- `api/src/Catalog/`: new aggregates, entities, value objects and domain events; repository port and MikroORM adapter rewritten around the aggregates; seed reworked; new migration for the seed record.
- `api/` scripts: `catalog:seed` / `catalog:seed:test` keep their names; a new `catalog:validate` replaces `tools/` `npm run validate*`. The content JSON must ship with the built app.
- `tools/` removed: the `huemans-tools` package, its lockfile and validate scripts.
- References to `tools/` paths updated: `CLAUDE.md`, `web/README.md`, `docs/prompts/attendee-flow-web.md`, `docs/next-steps.md`, `docs/api/attendee-api.md`, and the links in `initial-raw-specs.md`. `web/` keeps its own copy of the questions (it never imported `tools/`).
- Tests: catalog unit, integration and functional suites updated to the new model; Color Distribution suites keep working through the unchanged DTOs.
- Databases seeded before this change: the new migration records them as seeded when they already hold catalog content, so nobody has to recreate them.
- Owner: Diego (catalog), Adrián (model).
