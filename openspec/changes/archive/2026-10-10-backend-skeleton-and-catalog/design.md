# Design

## Context

`api/` is one NestJS app with one bounded context so far, `ColorDistribution` (`api/src/<BC>/{Domain,Application,Infrastructure}`, MikroORM `EntitySchema`, Postgres, Unit/Integration/Functional suites). The catalog content exists only as JSON in `tools/` (50 questions with 4 trait-tagged answers each, 51 icebreakers with 1-3 traits). Its schemas already moved to `api/src/Types/` (`Question.ts`, `Icebreaker.ts`, `Trait.ts`, `Theme.ts`), and `tools/` validates against them. `api/src/Types/PersonalityType.ts` holds the 4 personality types and their static reveal copy (nickname, blurb, trait chips), served by the assignment read.

Color distribution reads the trait-to-type mapping through its `TraitTypeMappingProvider` port, today backed by `ProvisionalTraitTypeMappingProvider`, a hard-coded table. Participation (`event-join-and-answers`) will need the questions to build a quiz and the trait behind each chosen answer; night icebreaker will need the icebreakers. Requirements are in `specs/catalog/spec.md`.

## Goals / Non-Goals

**Goals:**
- The content of the `tools/` JSON files in Postgres, loaded by a repeatable seed command.
- An in-process read API for the other contexts: questions, answer traits, icebreakers, trait-type mapping.
- Replace the provisional mapping in color distribution with the catalog's.

**Non-Goals:**
- HTTP endpoints. The web gets questions through the event's quiz (`event-join-and-answers`), never from the catalog directly, so answer traits never leave the server.
- Picking an event's questions or the night's icebreaker (owned by `event-join-and-answers` and `night-icebreaker`).
- Editing content through the app; content changes go through the JSON files and a re-seed.
- Moving the personality-type reveal copy out of `api/src/Types/`.

## Decisions

**Read-only context, no aggregate.** The catalog never changes state at runtime; it only serves content written by the seed. `Domain/` holds the read models `Question` (with `Answer`s) and `Icebreaker`, and the ports `QuestionRepository` (`all()`, `byIds(ids)`) and `IcebreakerRepository` (`all()`). No `Criteria`: there are only three fixed reads. One `Application/ApplicationService` exposes `questions()`, `questionsByIds(ids)`, `traitsOf(pairs)`, `icebreakers()` and `traitTypeMapping()`, plus `seed(questions, icebreakers)` for the command. `CatalogModule` exports the service so other modules can inject it.

**Postgres, filled by a seed command.** Tables `catalog_questions(id PK, theme, text)`, `catalog_answers(id PK, question_id FK, position, text, trait)` and `catalog_icebreakers(id PK, theme, text, traits text[])`, created by one migration. The command `pnpm catalog:seed [questions.json] [icebreakers.json]` (and `catalog:seed:test`) defaults to the two `tools/` files, parses both with `QuestionListSchema` and `IcebreakerListSchema` before touching the database, then upserts everything by id in one transaction. It boots a Nest application context so it uses the same repositories and config as the app. Alternatives: load the JSON into memory at boot — rejected, the deployed `api/` would need `tools/` on disk at runtime; copy the JSON into `api/` — rejected, two copies of the content drift. Reading the files from a command is not a runtime import of `tools/`.

**Upsert, never delete.** A question or icebreaker missing from the file stays in the database, because events store the ids of the questions they picked. Ids are the catalog's stable identity (`q0001`, `q0001-a`, `i0001`), so an edited text updates in place.

**Answer traits resolved from (question, answer) pairs.** `traitsOf` takes pairs rather than bare answer ids, so an answer submitted under the wrong question is ignored, matching the web contract ("pairs with an unknown question or answer id are ignored"). Repeats are kept, because the trait profile counts them.

**The mapping is code in `api/src/Types/TraitTypeMapping.ts`.** `TRAIT_TYPES: Record<TraitValue, PersonalityTypeValue>`: the compiler enforces that each of the 33 traits has exactly one type, and the team edits it by code review. It starts as today's provisional table, which becomes the first real version. Catalog's `traitTypeMapping()` returns it; color distribution gets a `CatalogTraitTypeMappingProvider` (in its `Infrastructure/Catalog/`) that calls the catalog service and builds its `TraitTypeMapping` value object, replacing `ProvisionalTraitTypeMappingProvider`. Alternative — a database table — rejected: there is no content file or editor for it, and a typed record catches gaps at build time.

**Tests.** Unit: the mapping covers every trait and every type, and each type's reveal chips map to that type. Integration: the repositories and `seed` against Postgres with small in-test fixtures (upsert, keep removed entries, invalid input writes nothing, `byIds` order and not-found, `traitsOf`). Functional: the seed command against the test database with the real `tools/` files (50 questions, 51 icebreakers, twice), and the color-distribution flow still assigning types with the catalog mapping. `clearDatabase` wipes catalog tables too, so suites that need content seed fixtures in `beforeEach`; a `seedCatalog` helper goes into `tests/Support/`.

## Risks / Trade-offs

- [The deployed database is empty until someone seeds it] → `catalog:seed` is part of the deploy steps next to `migration:up`; it is idempotent, so running it on every deploy is safe.
- [Changing the mapping after an event started gives later attendees types from a different table] → Accepted for the demo; assignments are final and the mapping only changes by code review.
- [Seeding reads files outside `api/`] → Only the command does; paths are arguments, so a deploy can point at copies.

## Migration Plan

1. `pnpm migration:up` (and `migration:up:test`) creates the three catalog tables.
2. `pnpm catalog:seed` (and `catalog:seed:test`) loads the content.
3. Rollback: the migration's `down` drops the three tables; nothing else references them yet.

## Open Questions

- Should the trait-type table be tuned before the demo (for example with bots, so the four types come out roughly even)? The provisional table gives 8/8/9/8 traits per type, which is a fair start.
