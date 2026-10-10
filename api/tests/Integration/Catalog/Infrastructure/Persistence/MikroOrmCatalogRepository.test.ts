import { EntityManager } from '@mikro-orm/postgresql';
import { TestingModule } from '@nestjs/testing';
import { PersonalityTypesNotDefined } from '@Huemans/Catalog/Domain/PersonalityTypesNotDefined';
import { CatalogAnswerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogAnswerSchema';
import { CatalogIcebreakerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogIcebreakerSchema';
import { CatalogPersonalityTypeProfileSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogPersonalityTypeProfileSchema';
import { CatalogQuestionSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogQuestionSchema';
import { CatalogTraitTypeSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogTraitTypeSchema';
import { MikroOrmCatalogRepository } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/MikroOrmCatalogRepository';
import { MikroOrmCatalogSeeder } from '@Huemans/Catalog/Infrastructure/Seed/MikroOrmCatalogSeeder';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import {
  aQuestion,
  anIcebreaker,
  realContent,
  removeCatalogFixtures,
  seedCatalogFiles,
} from '../../../../Support/catalog';
import { bootIntegration } from '../../../../Support/integration';

describe('MikroOrmCatalogRepository and MikroOrmCatalogSeeder', () => {
  let module: TestingModule;
  let repository: MikroOrmCatalogRepository;
  let seeder: MikroOrmCatalogSeeder;

  beforeAll(async () => {
    module = await bootIntegration({
      entities: [
        CatalogQuestionSchema,
        CatalogAnswerSchema,
        CatalogIcebreakerSchema,
        CatalogPersonalityTypeProfileSchema,
        CatalogTraitTypeSchema,
      ],
      providers: [MikroOrmCatalogRepository, MikroOrmCatalogSeeder],
    });
    repository = module.get(MikroOrmCatalogRepository);
    seeder = module.get(MikroOrmCatalogSeeder);
    await seedCatalogFiles(module);
  });

  afterAll(async () => {
    await removeCatalogFixtures(module.get(EntityManager).fork());
    await module.close();
  });

  it('testListsQuestionsOrderedByIdWithAnswersInOrder', async () => {
    const question = aQuestion(['thrifty', 'chaotic', 'loyal', 'romantic']);
    await seeder.seed({ questions: [question] });

    const all = await repository.allQuestions();
    const ids = all.map((found) => found.id.value);

    expect(ids).toEqual([...ids].sort());
    expect(all.map((found) => found.toDTO()).find((found) => found.id === question.id)).toEqual(question);
  });

  it('testUpdatesAnEditedQuestionAndKeepsAMissingOne', async () => {
    const edited = aQuestion();
    const kept = aQuestion();
    await seeder.seed({ questions: [edited, kept] });

    const newText = { ...edited, text: 'Edited text' };
    await seeder.seed({ questions: [newText] });

    const all = (await repository.allQuestions()).map((found) => found.toDTO());
    expect(all).toEqual(expect.arrayContaining([newText, kept]));
  });

  it('testReplacesTheAnswersOfAReseededQuestion', async () => {
    const question = aQuestion();
    await seeder.seed({ questions: [question] });

    const renamed = {
      ...question,
      answers: [...question.answers].reverse().map((answer) => ({ ...answer, id: `${answer.id}-renamed` })),
    };
    await seeder.seed({ questions: [renamed] });

    const found = (await repository.allQuestions())
      .map((found) => found.toDTO())
      .find((candidate) => candidate.id === question.id);
    expect(found).toEqual(renamed);
  });

  it('testAFailedWriteRollsBackTheWholeSeed', async () => {
    const question = aQuestion();
    const unstorable = { ...anIcebreaker(), text: null as unknown as string };

    await expect(seeder.seed({ questions: [question], icebreakers: [unstorable] })).rejects.toThrow();

    expect((await repository.allQuestions()).some((found) => found.id.value === question.id)).toBe(false);
  });

  it('testListsIcebreakersOrderedById', async () => {
    const icebreaker = anIcebreaker(['humorous', 'curious']);
    await seeder.seed({ icebreakers: [icebreaker] });

    const all = await repository.allIcebreakers();
    const ids = all.map((found) => found.id.value);
    const found = all.find((candidate) => candidate.id.value === icebreaker.id)!;

    expect(ids).toEqual([...ids].sort());
    expect(found.toDTO()).toEqual(icebreaker);
  });

  it('testReadsThePersonalityTypes', async () => {
    const { profiles, mapping } = realContent();

    const personalityTypes = await repository.personalityTypes();

    expect(personalityTypes.profileOf(new PersonalityType('dreamer'))).toEqual(
      profiles.find((profile) => profile.type === 'dreamer'),
    );
    expect(personalityTypes.toDTO().mapping).toEqual(mapping);
  });

  it('testMissingPersonalityTypesAreNotDefined', async () => {
    // Profiles and mapping have fixed keys shared by parallel suites, so empty tables are simulated instead of emptied.
    const unseeded = new MikroOrmCatalogRepository({ find: () => Promise.resolve([]) } as unknown as EntityManager);

    await expect(unseeded.personalityTypes()).rejects.toThrow(PersonalityTypesNotDefined);
  });
});
