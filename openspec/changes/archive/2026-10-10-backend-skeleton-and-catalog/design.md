# Design

## Context

The contract is `docs/domain/catalog/model.md` (read-only context, no aggregate, no events; read models `Question`, `Icebreaker`, `PersonalityTypeProfile`, `TraitTypeMapping`; one `CatalogRepository` with `allQuestions`, `allIcebreakers`, `profileOf`, `mapping`). Motivation is in `proposal.md`, requirements in `specs/catalog/spec.md`.

Current state on `main`: `Trait` and `PersonalityType` are shared-kernel value objects; `Theme` is in `Catalog/Domain/ValueObject`; the question and icebreaker JSON schemas and the static profiles are in `Catalog/Infrastructure/Content`, and `tools/` validates its JSON against those schemas through relative imports. Color distribution reads the mapping through `TraitTypeMappingProvider` (today `ProvisionalTraitTypeMappingProvider`) and the reveal copy through `ColorExplainer` (today `StaticColorExplainer` reading the static profiles).

## Goals / Non-Goals

**Goals:**
- All four kinds of content authored as JSON in `tools/`, seeded into Postgres by a repeatable command.
- Catalog's four named reads, used by color distribution for the mapping and the reveal copy.

**Non-Goals:**
- HTTP endpoints: the web gets questions through the event's quiz, so answer traits never leave the server.
- Choosing an event's questions or the night's icebreaker (`event-join-and-answers`, `night-icebreaker`).
- Editing content at runtime.

## Decisions

**Content files.** Two new files next to the existing ones: `tools/src/personality-types/profiles.json` (an array of `{ type, nickname, blurb, traits }`) and `tools/src/personality-types/trait-types.json` (an object from each trait to its type, so a missing or repeated trait is visible at a glance). Their schemas live in `Catalog/Infrastructure/Content` (`PersonalityTypeProfileList.ts`, `TraitTypeMappingContent.ts`), as do the existing ones, plus a `checkProfileChips(profiles, mapping)` cross-check. `tools/` gets a `validate:personality-types` script using the same schemas and check. The api's static `PersonalityTypeProfiles.ts` and the provisional table are deleted; their content becomes the first version of the JSON.

**Domain.** Value objects per the model: `QuestionId`, `AnswerId`, `IcebreakerId` (non-empty strings), `Theme` (existing), `Answer` (id, rule-free text, `SK::Trait`), and the collections `AnswerCollection` (exactly 4, unique ids), `IcebreakerTraitCollection` (1 to 3, distinct) and `ProfileTraitCollection` (exactly 3, distinct). Read models are immutable classes holding these. Catalog's `TraitTypeMapping` read model checks that each of the 33 traits appears exactly once; color distribution keeps its own `TraitTypeMapping` value object with the rule that uses it. A missing profile is a `PersonalityTypeProfileNotFound` (`NotFoundError`).

**Persistence.** One migration with five tables: `catalog_questions(id, theme, text)`, `catalog_answers(id, question_id FK, position, text, trait)`, `catalog_icebreakers(id, theme, text, traits text[])`, `catalog_personality_type_profiles(type, nickname, blurb, traits text[])`, `catalog_trait_types(trait, personality_type)`. Row-shaped `EntitySchema`s (`*Schema.ts`) map the tables; `MikroOrmCatalogRepository` builds the read models from the rows, so the value objects validate everything that leaves the repository. Alternative — mapping the read models directly as entities — rejected: nested collections of value objects would need embeddables or relations for no gain on a read-only table set.

**Seeding is infrastructure.** The model places the content checks at the boundary, so the seed is not an application use case: `Infrastructure/Seed/CatalogFiles.ts` reads and validates all four files and runs the cross-check, and `MikroOrmCatalogSeeder` upserts every table by key in one transaction, never deleting. `Infrastructure/Seed/seed.ts` boots a Nest application context and wires the two; scripts `catalog:seed` and `catalog:seed:test`. Errors name the file and the entry (by id, or by type for profiles).

**Application.** `Catalog/Application/ApplicationService` exposes `allQuestions()`, `allIcebreakers()`, `profileOf(type)` and `mapping()`, each a pass-through to `CatalogRepository`. `CatalogModule` exports it. In color distribution, `CatalogTraitTypeMappingProvider` turns the catalog mapping into its `TraitTypeMapping` value object (replacing the provisional provider), and `StaticColorExplainer` reads `profileOf` instead of the static file.

**Tests.** Unit: every value object, collection and read-model invariant; the content schemas and the cross-check. Integration: the repository and seeder against Postgres. Functional: seeding the real files twice; invalid file and bad chip write nothing; color distribution with the seeded mapping and profiles. Suites share the test database in parallel without truncating, so fixtures use random ids, and suites that need the real content call a `seedCatalogFiles` helper (idempotent) in `beforeAll`.

## Risks / Trade-offs

- [The reveal now depends on seeded profiles] → An unseeded database answers the assignment read with a 404 from `PersonalityTypeProfileNotFound`. `catalog:seed` belongs in setup and deploy right after `migration:up`.
- [Changing the mapping after an event started gives later attendees types from a different table] → Accepted; assignments are final and content changes go through review and a re-seed.

## Migration Plan

1. `pnpm migration:up` (and `:test`) creates the five tables.
2. `pnpm catalog:seed` (and `:test`) loads the content.
3. Rollback: the migration's `down` drops the five tables.
