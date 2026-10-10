# Tasks

## 1. Trait-type mapping (unit tests first)

- [ ] 1.1 Add `api/src/Types/TraitTypeMapping.ts` with `TRAIT_TYPES: Record<TraitValue, PersonalityTypeValue>`, starting from the provisional table, and verify a unit test that every trait has a type and every personality type has at least one trait
- [ ] 1.2 Verify with a unit test that each personality type's reveal chips in `PERSONALITY_TYPE_PROFILES` map to that type in `TRAIT_TYPES`

## 2. Domain and persistence

- [ ] 2.1 Add `api/src/Catalog/Domain` with the read models `Question`, `Answer`, `Icebreaker` and the ports `QuestionRepository` (`all`, `byIds`) and `IcebreakerRepository` (`all`), with no NestJS or ORM imports, and verify `pnpm lint` passes
- [ ] 2.2 Add a migration for `catalog_questions`, `catalog_answers` (with `position` and a foreign key to the question) and `catalog_icebreakers` (`traits text[]`), and verify it applies and rolls back on a clean database
- [ ] 2.3 Map the read models with MikroORM `EntitySchema` in `Catalog/Infrastructure/Persistence/MikroOrm` and implement both repositories, including an upsert by id that never deletes, and verify integration tests: `all` orders questions and icebreakers by id with answers in file order, `byIds` keeps the requested order and reports unknown ids, and upserting an edited question updates it while a missing one is kept

## 3. Application and module

- [ ] 3.1 Implement `Catalog/Application/ApplicationService` (`questions`, `questionsByIds`, `traitsOf`, `icebreakers`, `traitTypeMapping`, `seed`), with `seed` running in one transaction, and wire it in `Catalog/Infrastructure/CatalogModule.ts`, exported and imported in `AppModule`
- [ ] 3.2 Verify `traitsOf` with integration tests: matching pairs return their traits in order with repeats kept; unknown question, unknown answer and an answer of another question are ignored
- [ ] 3.3 Add a `seedCatalog` helper to `tests/Support/` that seeds small fixtures, for suites whose database is cleared before each test

## 4. Seed command

- [ ] 4.1 Add the seed command (`Catalog/Infrastructure/Cli/seed.ts`, booting a Nest application context) that reads both files, parses them with `QuestionListSchema` and `IcebreakerListSchema` before writing, and calls `seed`; add the scripts `catalog:seed` and `catalog:seed:test`, defaulting to the two `tools/` files
- [ ] 4.2 Verify with functional tests against the test database: seeding the real files yields 50 questions with 4 answers and 51 icebreakers; seeding twice changes nothing; a file with an unknown trait fails, names the entry and writes nothing

## 5. Color distribution uses the catalog mapping

- [ ] 5.1 Add `CatalogTraitTypeMappingProvider` in `ColorDistribution/Infrastructure/Catalog`, calling the catalog service and building `TraitTypeMapping`; register it for `TRAIT_TYPE_MAPPING_PROVIDER` and delete `ProvisionalTraitTypeMappingProvider` and its test
- [ ] 5.2 Verify with a functional test that an attendee whose traits all map to planner is assigned personality type planner, and that the existing color-distribution suites still pass

## 6. Wrap up

- [ ] 6.1 Add `pnpm catalog:seed` to the API commands in `CLAUDE.md` and to the deploy steps, and verify `pnpm lint`, `pnpm build` and `pnpm test` pass
