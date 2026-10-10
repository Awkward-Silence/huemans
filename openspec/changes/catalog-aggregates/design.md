# Design

## Context

See proposal.md (Why) and `docs/domain/catalog/model.md` 2.0.0, which is the contract: aggregate, value object and event names below are the model's.

Current state on `catalog-model`:
- `api/src/Catalog/Domain` holds read models (`Question`, `Icebreaker`, `PersonalityTypeProfile`, `TraitTypeMapping`) with raw `string` text, built only by `MikroOrmCatalogRepository` on reads.
- The seed (`Infrastructure/Seed`) parses the `tools/` JSON with zod schemas that carry every content rule (`refine`, `superRefine`, `checkProfileChips`), and `MikroOrmCatalogSeeder` upserts rows, never touching the domain.
- Shared kernel already gives `AggregateRoot` (record / `pullDomainEvents` / `toDTO`), `DomainEvent`, `StringValueObject`, `Collection`, and the `TransactionManager` and `EventDispatcher` ports.
- Test suites share one test database in parallel and never truncate the catalog.

## Goals / Non-Goals

**Goals:**
- Every content rule is enforced by the aggregates and value objects; nothing reaches the database that an aggregate did not accept.
- The seed is once-only and safe to run concurrently (several test suites, or two deploys).
- The DTOs other contexts read stay byte-for-byte compatible, so Color Distribution and its tests do not change.

**Non-Goals:**
- Revising or deleting content after the seed (model 2.0.0: frozen).
- Any subscriber for the new Catalog events.
- Moving the web's copy of the questions (it keeps its own mock fixtures).

## Decisions

### 1. Aggregates with two ways in: `author`/`define` and rebuild
`Question`, `Icebreaker` and `PersonalityTypes` extend `AggregateRoot`. Their constructor is private; `Question.author(...)`, `Icebreaker.author(...)` and `PersonalityTypes.define(...)` build them and record `QuestionAuthored`, `IcebreakerAuthored`, `PersonalityTypesDefined`. The repository rebuilds stored aggregates through a separate static that records nothing (reading must not emit events). `toDTO()` returns exactly today's `QuestionDTO`, `IcebreakerDTO`; `PersonalityTypes` exposes `profileOf(PersonalityType)` and `mapping()` whose DTOs keep today's `PersonalityTypeProfileDTO` and `TraitTypeMappingDTO`.
- `Answer` and `PersonalityTypeProfile` become entities (identity: `AnswerId`, `SK::PersonalityType`); `TraitType` is a composite VO; `TraitTypeMapping` and `PersonalityTypeProfileCollection` are typed collections with their own rules. `define` checks the cross rule (each chip mapped to its profile's type).
- `PersonalityTypesDefined` needs an `aggregateId`: the singleton uses the fixed id `personality-types`.
- Events live in `api/src/Catalog/Domain/Event/` (the publishing context owns them, per CLAUDE.md).
- Alternative considered: keep read models and validate in a domain service at the seed. Rejected: it is the "rules outside the aggregate" shape the model replaces.

### 2. A content source port maps the files into aggregates
New port `Domain/Port/CatalogContentSource` with `read(): AuthoredCatalog` (the authored questions, icebreakers and personality types). Its adapter `Infrastructure/Content/JsonCatalogContentSource` reads the four JSON files, checks their **shape** with zod, and maps each entry through the value objects and `author`/`define`. A failure is rethrown as `InvalidCatalogContent` naming the file and the entry (`q0003`, `planner`), keeping today's error format (`q0003 answers.1.trait: ...`).
- The zod schemas keep structure only (objects, arrays, strings). Value rules (enums, lengths, uniqueness, counts, chip/mapping) are removed from them and `checkProfileChips` is deleted: the domain is the single owner, and errors still name the entry because the adapter maps entry by entry.
- Alternative considered: the application service maps DTOs into aggregates. Rejected: naming the entry needs a try/catch per entry, which is logic the application service must not hold; the mapping is the infrastructure step the model describes ("the seed maps the JSON into the aggregates").

### 3. Seed orchestration and the once-only record
`ApplicationService.seed()`:
1. `content = source.read()` (throws before any database work if invalid);
2. inside `TransactionManager.run`: `if (!await seedRecord.markSeeded(now)) return already-seeded`; then `repository.saveQuestions`, `saveIcebreakers`, `savePersonalityTypes`;
3. after commit, dispatch the events pulled from the aggregates.

New port `Domain/Port/CatalogSeedRecord.markSeeded(at): Promise<boolean>`, MikroORM adapter: `insert into catalog_seed (id, seeded_at) values ('catalog', $1) on conflict do nothing`, returning whether a row was inserted. Because it runs first in the same transaction, a concurrent second seed blocks on the key until the first commits, then sees the conflict and writes nothing; a failed write rolls the record back too.
- `seed.ts` prints `Seeded ...` or `Catalog already seeded at <time>; nothing written.` and exits 0 in both cases (a re-run on deploy is not an error).
- `MikroOrmCatalogSeeder` is removed; writes go through the repository's save methods (inserts; no upsert, no answer replacement).
- Alternative considered: check "is seeded" before the transaction. Rejected: racy between parallel test suites.

### 4. Repository port around aggregates
`CatalogRepository`: `allQuestions(): Question[]`, `allIcebreakers(): Icebreaker[]`, `personalityTypes(): PersonalityTypes` (throws `PersonalityTypesNotDefined`, a plain `Error` → 500, like today's `PersonalityTypeProfileNotFound`), plus `saveQuestions`, `saveIcebreakers`, `savePersonalityTypes`. Tables stay as they are (`catalog_questions`, `catalog_answers`, `catalog_icebreakers`, `catalog_personality_type_profiles`, `catalog_trait_types`); only the mapping code changes. `ApplicationService` keeps `allQuestions`, `allIcebreakers`, `profileOf(type)`, `mapping()` with unchanged DTOs, and adds `seed()` and `check()`.

### 5. Content files move into Catalog infrastructure; `tools/` goes
The four files move to `api/src/Catalog/Infrastructure/Content/` as `questions.json`, `icebreakers.json`, `profiles.json`, `trait-types.json` (dropping the misleading `.test` suffix). Default paths are resolved from the content module's own directory (`__dirname`), not the working directory, so the seed works from `src/` (ts-node) and from `dist/`; `nest-cli.json` copies `Catalog/Infrastructure/Content/*.json` as assets. The whole `tools/` package is deleted; `pnpm catalog:validate` (`ApplicationService.check()` → `source.read()`, no Nest app, no database) replaces its three `validate` scripts.

### 6. Tests
- Unit: each text VO (limits, trimming), `AnswerCollection`, `TraitTypeMapping`, `PersonalityTypeProfileCollection`, `Question.author`/`Icebreaker.author`/`PersonalityTypes.define` (rules and recorded events). Existing catalog VO tests are kept and extended.
- Integration: `MikroOrmCatalogRepository` save/read round trip with random-id fixtures (cleaned by `removeCatalogFixtures`), and `MikroOrmCatalogSeedRecord` (first mark wins, second returns false) against the real database; `JsonCatalogContentSource` against the real files and edited temp copies.
- Functional: the once-only seed scenarios (first seed, second seed does nothing, events, failed write) need a database that was never seeded, which the shared test database is not. A helper in `tests/Support` creates a throwaway database on the test server, runs the migrations against it, points the app or the `catalog:seed` process at it, and drops it afterwards. The `catalog:validate` command is tested as a process, like today's seed command test.
- Other suites keep calling `seedCatalogFiles` (now `ApplicationService.seed()`): the first one seeds the shared test database, the rest are no-ops.

## Risks / Trade-offs

- [Existing databases already hold content but no seed record, so the next seed would hit primary-key conflicts] → the migration that creates `catalog_seed` also inserts the record when `catalog_questions` is not empty.
- [Frozen content: a typo found after the demo database is seeded needs a database recreate] → accepted for the MVP (model 2.0.0); a revise path can be added later as its own change.
- [Throwaway databases make the functional seed tests slower] → only the seed suite uses them; one database per suite, created in `beforeAll`.
- [Removing `tools/` breaks anyone running `npm run validate` there, and links in docs] → `catalog:validate` replaces it; all references are updated in the same change (tasks).
- [The JSON must ship with the built app] → `nest-cli.json` assets plus a check in the build task that `dist/Catalog/Infrastructure/Content/*.json` exists.

## Migration Plan

1. Deploy: run `pnpm migration:up` (creates `catalog_seed`, backfills it on already-seeded databases), then `pnpm catalog:seed`, which seeds a fresh database or reports it was already seeded.
2. Teammates: `pnpm migration:up && pnpm migration:up:test` after pulling; nothing to recreate.
3. Rollback: revert the change and run the migration's `down` (drops `catalog_seed`); the content tables are untouched by this change, so the old seed keeps working.
