# Tasks

## 1. Content files and schemas

- [ ] 1.1 Add `tools/src/personality-types/profiles.json` and `trait-types.json` from today's static profiles and provisional table
- [ ] 1.2 Add `PersonalityTypeProfileList.ts` and `TraitTypeMappingContent.ts` schemas and a `checkProfileChips` cross-check in `Catalog/Infrastructure/Content`, add the answer-id uniqueness rule to the question schema, and verify unit tests for a missing profile, an unmapped trait, a repeated answer id and a chip mapped to another type
- [ ] 1.3 Add `validate:personality-types` to `tools/` using the same schemas and check, and verify all three `tools/` validators pass on the current files

## 2. Domain (unit tests first)

- [ ] 2.1 Add `QuestionId`, `AnswerId`, `IcebreakerId`, `Answer`, `AnswerCollection`, `IcebreakerTraitCollection` and `ProfileTraitCollection`, and verify unit tests for empty ids, the 4-answer and unique-id rules, the 1-3 distinct traits rule and the exactly-3 distinct chips rule
- [ ] 2.2 Add the read models `Question`, `Icebreaker`, `PersonalityTypeProfile` and `TraitTypeMapping` (each trait exactly once), `PersonalityTypeProfileNotFound`, and the `CatalogRepository` port, and verify unit tests for the mapping invariant and `pnpm lint`

## 3. Persistence

- [ ] 3.1 Add the migration for the five catalog tables, and verify it applies and rolls back on a clean database
- [ ] 3.2 Add the row `EntitySchema`s, `MikroOrmCatalogRepository` and `MikroOrmCatalogSeeder` (upsert by key, never delete, one transaction), and verify integration tests: questions and icebreakers ordered by id with answers in order, `profileOf` and its not-found, `mapping`, an edited question updated and a missing one kept

## 4. Application and seed command

- [ ] 4.1 Add `Catalog/Application/ApplicationService` (`allQuestions`, `allIcebreakers`, `profileOf`, `mapping`) and `CatalogModule` exporting it, imported in `AppModule`
- [ ] 4.2 Add `Infrastructure/Seed/CatalogFiles.ts` (read, validate and cross-check all four files, errors naming file and entry) and `seed.ts`, with scripts `catalog:seed` and `catalog:seed:test`
- [ ] 4.3 Add a `seedCatalogFiles` test helper, and verify functional tests: the real files seed 50 questions, 51 icebreakers, 4 profiles and 33 mapping pairs, twice with the same result; an invalid question and a bad chip both fail and write nothing

## 5. Color distribution reads the catalog

- [ ] 5.1 Add `CatalogTraitTypeMappingProvider` and register it for `TRAIT_TYPE_MAPPING_PROVIDER`, deleting `ProvisionalTraitTypeMappingProvider` and its test
- [ ] 5.2 Make `StaticColorExplainer` read `profileOf` from the catalog and delete `PersonalityTypeProfiles.ts`
- [ ] 5.3 Verify with functional tests that planner traits give personality type planner and that a dreamer's reveal copy is the catalog's dreamer profile, and that all existing suites pass

## 6. Wrap up

- [ ] 6.1 Add the seed commands to `CLAUDE.md`, and verify `pnpm lint`, `pnpm build`, `pnpm test` and the `tools/` typecheck pass
