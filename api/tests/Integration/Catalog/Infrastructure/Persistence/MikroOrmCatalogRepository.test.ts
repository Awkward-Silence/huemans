import { EntityManager } from '@mikro-orm/postgresql';
import { TestingModule } from '@nestjs/testing';
import { PersonalityTypeProfileNotFound } from '@Huemans/Catalog/Domain/PersonalityTypeProfileNotFound';
import { CatalogAnswerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogAnswerSchema';
import { CatalogIcebreakerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogIcebreakerSchema';
import { CatalogPersonalityTypeProfileSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogPersonalityTypeProfileSchema';
import { CatalogQuestionSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogQuestionSchema';
import { CatalogTraitTypeSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogTraitTypeSchema';
import { MikroOrmCatalogRepository } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/MikroOrmCatalogRepository';
import { MikroOrmCatalogSeeder } from '@Huemans/Catalog/Infrastructure/Seed/MikroOrmCatalogSeeder';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { aQuestion, anIcebreaker, realContent, seedCatalogFiles } from '../../../../Support/catalog';
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

  it('testListsIcebreakersOrderedById', async () => {
    const icebreaker = anIcebreaker(['humorous', 'curious']);
    await seeder.seed({ icebreakers: [icebreaker] });

    const all = await repository.allIcebreakers();
    const ids = all.map((found) => found.id.value);
    const found = all.find((candidate) => candidate.id.value === icebreaker.id)!;

    expect(ids).toEqual([...ids].sort());
    expect(found.toDTO()).toEqual(icebreaker);
  });

  it('testReadsTheProfileOfAType', async () => {
    const dreamer = realContent().profiles.find((profile) => profile.type === 'dreamer')!;

    const profile = await repository.profileOf(new PersonalityType('dreamer'));

    expect(profile.toDTO()).toEqual(dreamer);
  });

  it('testReadsTheMappingOfAllTraits', async () => {
    const mapping = await repository.mapping();

    expect(mapping.toDTO()).toEqual(realContent().mapping);
  });

  it('testMissingProfileIsNotFound', async () => {
    // Profiles have fixed keys shared by parallel suites, so an unseeded table is simulated instead of emptied.
    const unseeded = new MikroOrmCatalogRepository({
      findOne: () => Promise.resolve(null),
    } as unknown as EntityManager);

    await expect(unseeded.profileOf(new PersonalityType('planner'))).rejects.toThrow(PersonalityTypeProfileNotFound);
  });
});
