import { EntityManager } from '@mikro-orm/postgresql';
import { TestingModule } from '@nestjs/testing';
import { PersonalityTypeProfileNotFound } from '@Huemans/Catalog/Domain/PersonalityTypeProfileNotFound';
import { Question } from '@Huemans/Catalog/Domain/Question';
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

const asPlain = (question: Question) => ({
  id: question.id.value,
  theme: question.theme.value,
  text: question.text,
  answers: question.answers
    .all()
    .map((answer) => ({ id: answer.id.value, text: answer.text, trait: answer.trait.value })),
});

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
    expect(all.map(asPlain).find((found) => found.id === question.id)).toEqual(question);
  });

  it('testUpdatesAnEditedQuestionAndKeepsAMissingOne', async () => {
    const edited = aQuestion();
    const kept = aQuestion();
    await seeder.seed({ questions: [edited, kept] });

    const newText = { ...edited, text: 'Edited text' };
    await seeder.seed({ questions: [newText] });

    const all = (await repository.allQuestions()).map(asPlain);
    expect(all).toEqual(expect.arrayContaining([newText, kept]));
  });

  it('testListsIcebreakersOrderedById', async () => {
    const icebreaker = anIcebreaker(['humorous', 'curious']);
    await seeder.seed({ icebreakers: [icebreaker] });

    const all = await repository.allIcebreakers();
    const ids = all.map((found) => found.id.value);
    const found = all.find((candidate) => candidate.id.value === icebreaker.id)!;

    expect(ids).toEqual([...ids].sort());
    expect(found.traits.all().map((trait) => trait.value)).toEqual(['humorous', 'curious']);
  });

  it('testReadsTheProfileOfAType', async () => {
    const dreamer = realContent().profiles.find((profile) => profile.type === 'dreamer')!;

    const profile = await repository.profileOf(new PersonalityType('dreamer'));

    expect(profile.nickname).toBe(dreamer.nickname);
    expect(profile.traits.all().map((trait) => trait.value)).toEqual(dreamer.traits);
  });

  it('testReadsTheMappingOfAllTraits', async () => {
    const mapping = await repository.mapping();

    expect(Object.fromEntries(mapping.pairs.map(([trait, type]) => [trait.value, type.value]))).toEqual(
      realContent().mapping,
    );
  });

  it('testMissingProfileIsNotFound', async () => {
    // Profiles have fixed keys shared by parallel suites, so an unseeded table is simulated instead of emptied.
    const unseeded = new MikroOrmCatalogRepository({
      findOne: () => Promise.resolve(null),
    } as unknown as EntityManager);

    await expect(unseeded.profileOf(new PersonalityType('planner'))).rejects.toThrow(PersonalityTypeProfileNotFound);
  });
});
