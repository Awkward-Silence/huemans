# Tasks

## 1. Trait-type mapping (unit tests first)

- [x] 1.1 Add `api/src/Types/TraitTypeMapping.ts` with `TRAIT_TYPES: Record<TraitValue, PersonalityTypeValue>`, starting from the provisional table, and verify a unit test that every trait has a type and every personality type has at least one trait
- [x] 1.2 Verify with a unit test that each personality type's reveal chips in `PERSONALITY_TYPE_PROFILES` map to that type in `TRAIT_TYPES`

## 2. Domain and persistence

- [x] 2.1 Add `api/src/Catalog/Domain` with the read models `Question`, `Answer`, `Icebreaker` (the types from `api/src/Types/`), a `QuestionSelection` (requested order, missing ids, answer traits; unit-tested) and the ports `QuestionRepository` (`all`, `byIds`) and `IcebreakerRepository` (`all`), with no NestJS or ORM imports, and verify `pnpm lint` passes
- [x] 2.2 Add a migration for `catalog_questions`, `catalog_answers` (with `position` and a foreign key to the question) and `catalog_icebreakers` (`traits text[]`), and verify it applies and rolls back on a clean database
- [x] 2.3 Map the read models with MikroORM `EntitySchema` in `Catalog/Infrastructure/Persistence/MikroOrm` and implement both repositories, including an upsert by id that never deletes, and verify integration tests: `all` orders questions and icebreakers by id with answers in file order, `byIds` returns only existing questions, and upserting an edited question updates it while a missing one is kept

## 3. Application and module

- [x] 3.1 Implement `Catalog/Application/ApplicationService` (`questions`, `questionsByIds`, `traitsOf`, `icebreakers`, `traitTypeMapping`, `seed`), with `seed` running in one transaction, and wire it in `Catalog/Infrastructure/CatalogModule.ts`, exported and imported in `AppModule`
- [x] 3.2 Verify `traitsOf` with tests against Postgres (through the booted app): matching pairs return their traits in order with repeats kept; unknown question, unknown answer and an answer of another question are ignored
- [x] 3.3 Add a `seedCatalog` helper to `tests/Support/` that seeds small fixtures, for suites whose database is cleared before each test

## 4. Seed command

- [x] 4.1 Add the seed command (`Catalog/Infrastructure/Cli/seed.ts`, booting a Nest application context) that reads both files, parses them with `QuestionListSchema` and `IcebreakerListSchema` before writing, and calls `seed`; add the scripts `catalog:seed` and `catalog:seed:test`, defaulting to the two `tools/` files
- [x] 4.2 Verify with functional tests against the test database: seeding the real files yields 50 questions with 4 answers and 51 icebreakers; seeding twice changes nothing; a file with an unknown trait fails, names the entry and writes nothing

## 5. Color distribution uses the catalog mapping

- [x] 5.1 Add `CatalogTraitTypeMappingProvider` in `ColorDistribution/Infrastructure/Catalog`, calling the catalog service and building `TraitTypeMapping`; register it for `TRAIT_TYPE_MAPPING_PROVIDER` and delete `ProvisionalTraitTypeMappingProvider` and its test
- [x] 5.2 Verify with a functional test that an attendee whose traits all map to planner is assigned personality type planner, and that the existing color-distribution suites still pass

## 6. Wrap up

- [x] 6.1 Add `pnpm catalog:seed` to the API commands in `CLAUDE.md` and to the deploy steps, and verify `pnpm lint`, `pnpm build` and `pnpm test` pass
