# Tasks

## 1. Value objects and entities (unit tests first)

- [x] 1.1 Add `QuestionText`, `AnswerText` (not empty, at most 80), `IcebreakerText`, `Blurb` (not empty, at most 200) and `Nickname` (trimmed, then not empty, at most 80), and verify unit tests at each limit (80/81, 200/201), for empty text, and for a nickname stored trimmed and a blank one rejected
- [x] 1.2 Turn `Answer` into an entity (`AnswerId`, `AnswerText`, `SK::Trait`) and keep `AnswerCollection` (exactly 4, unique AnswerIds), and verify the existing collection unit tests pass with `AnswerText`
- [x] 1.3 Add `TraitType` (composite `SK::Trait` + `SK::PersonalityType`), `TraitTypeMapping` as a collection of `TraitType` (every trait exactly once), `PersonalityTypeProfile` entity (`SK::PersonalityType`, `Nickname`, `Blurb`, `ProfileTraitCollection`) and `PersonalityTypeProfileCollection` (exactly one per type), and verify unit tests for a missing and a repeated trait, and a missing and a duplicated profile

## 2. Aggregates and events (unit tests first)

- [x] 2.1 Add `QuestionAuthored`, `IcebreakerAuthored` and `PersonalityTypesDefined` in `Catalog/Domain/Event` (payloads per the model; `PersonalityTypesDefined` uses the fixed id `personality-types`), and verify `toPrimitives()` in unit tests
- [x] 2.2 Make `Question` and `Icebreaker` aggregate roots with a private constructor, `author(...)` that records its event, a rebuild static that records nothing, and `toDTO()` returning today's `QuestionDTO`/`IcebreakerDTO`, and verify unit tests for authoring (event recorded once) and rebuilding (no event)
- [x] 2.3 Add the `PersonalityTypes` aggregate with `define(mapping, profiles)` (records `PersonalityTypesDefined`, rejects a profile chip mapped to another type), a rebuild static, `profileOf(type)` returning today's `PersonalityTypeProfileDTO` and `toDTO()` whose `mapping` is today's `TraitTypeMappingDTO`, and `PersonalityTypesNotDefined` (plain error); remove the old `PersonalityTypeProfile`/`TraitTypeMapping` read models and `PersonalityTypeProfileNotFound`; verify unit tests for the chip rule (planner with `curious`), the event, and `pnpm lint` (no framework imports in `Domain/`)

## 3. Ports, persistence and the seed record

- [x] 3.1 Rewrite the `CatalogRepository` port (`allQuestions`, `allIcebreakers`, `personalityTypes`, `saveQuestions`, `saveIcebreakers`, `savePersonalityTypes`) and add the `CatalogSeedRecord` (`markSeeded(at): boolean`) and `CatalogContentSource` (`read()`) ports, and verify `pnpm build` compiles the domain
- [x] 3.2 Add the migration creating `catalog_seed` (`id` text primary key, `seeded_at` timestamptz) that inserts the `catalog` record when `catalog_questions` already has rows, and verify on the test database that it applies, backfills an already-seeded database, and rolls back
- [x] 3.3 Rewrite `MikroOrmCatalogRepository` around the aggregates (inserts, no upsert; rebuild on read), and verify integration tests: save/read round trip for a fixture question, icebreaker and the real personality types, ordering by id, answers in authored order, `PersonalityTypesNotDefined` when missing, fixtures removed afterwards
- [x] 3.4 Add `MikroOrmCatalogSeedRecord` (`insert ... on conflict do nothing`), and verify integration tests: the first `markSeeded` returns true, a second returns false, and a rolled-back transaction leaves no record

## 4. Content files move into Catalog infrastructure

- [x] 4.1 Move the four JSON files from `tools/src/` to `api/src/Catalog/Infrastructure/Content/` (`questions.json`, `icebreakers.json`, `profiles.json`, `trait-types.json`), resolve the default paths from the module directory, add them as `nest-cli.json` assets, and verify `pnpm build` puts them in `dist/Catalog/Infrastructure/Content/`
- [x] 4.2 Reduce the zod schemas to shape only (drop enums, lengths, uniqueness, counts and `checkProfileChips`), and verify the schema unit tests now only cover structure
- [x] 4.3 Add `JsonCatalogContentSource` mapping each entry through the value objects and `author`/`define`, rethrowing failures as `InvalidCatalogContent` naming the file and entry, and verify integration tests: the real files give 50 questions, 51 icebreakers and the personality types; an edited copy with `grumpy` in `q0003` names `q0003 answers.1.trait`; a planner chip `curious` names `planner`; an 81-character question text names the question

## 5. Application service and commands

- [x] 5.1 Add `seed()` (read the source, then in one transaction `markSeeded` then save everything, then dispatch the pulled events; returns seeded or already-seeded) to Catalog's `ApplicationService` (no `check()`: `catalog:validate` must not open a database, so it calls the content source directly), keep `allQuestions`, `allIcebreakers`, `profileOf`, `mapping` on top of the new repository, and verify the Color Distribution functional suites still pass unchanged
- [x] 5.2 Rewrite `seed.ts` on `ApplicationService.seed()` and delete `MikroOrmCatalogSeeder` (kept until here so the seed keeps working) (prints `Seeded ...` or `Catalog already seeded at ...; nothing written.`, exit 0 in both) and add `catalog:validate` (no Nest app, no database), and verify both by running them against the test database
- [x] 5.3 Point `seedCatalogFiles`, `realContent` and the fixture helpers in `tests/Support/catalog.ts` at the new API, and verify the full suite (`pnpm test`) passes with the shared test database

## 6. Once-only seed, end to end

- [x] 6.1 Add a `tests/Support` helper that creates a throwaway database on the test server, migrates it and drops it afterwards, and verify it leaves no database behind after the suite
- [x] 6.2 Verify functional tests on a throwaway database: the first seed loads 50/51/4/33 and records the seed time; a second seed with edited files reports already seeded and changes nothing; the first seed publishes 50 + 51 + 1 events and the second none; a failed write leaves no content and no seed record
- [x] 6.3 Verify functional tests for the commands as processes: `catalog:seed` exit codes and messages, and `catalog:validate` succeeding on the real files and naming `q0003` on an invalid copy without touching any database

## 7. Remove `tools/` and update references

- [x] 7.1 Delete the `tools/` package (`package.json`, lockfile, `tsconfig.json`, validate scripts) and verify no file outside `openspec/changes/archive/` still references `tools/` (`git grep`)
- [ ] 7.2 Update `CLAUDE.md` (API commands, the catalog bullet, the architecture tree without `tools/`, and the OpenSpec change list with `catalog-aggregates`), `web/README.md`, `docs/prompts/attendee-flow-web.md`, `docs/next-steps.md`, `docs/api/attendee-api.md`, the links in `initial-raw-specs.md` and the `Trait.ts` comment, and verify every new path exists
- [ ] 7.3 Run `pnpm lint`, `pnpm build` and `pnpm test` in `api/` and verify all pass
