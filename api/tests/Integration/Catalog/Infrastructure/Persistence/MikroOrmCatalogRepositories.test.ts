import { TestingModule } from '@nestjs/testing';
import { CatalogAnswerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogAnswerSchema';
import { CatalogIcebreakerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogIcebreakerSchema';
import { CatalogQuestionSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogQuestionSchema';
import { MikroOrmIcebreakerRepository } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/MikroOrmIcebreakerRepository';
import { MikroOrmQuestionRepository } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/MikroOrmQuestionRepository';
import { aQuestion, anIcebreaker } from '../../../../Support/catalog';
import { bootIntegration } from '../../../../Support/integration';

describe('MikroOrm catalog repositories', () => {
  let module: TestingModule;
  let questions: MikroOrmQuestionRepository;
  let icebreakers: MikroOrmIcebreakerRepository;

  beforeAll(async () => {
    module = await bootIntegration({
      entities: [CatalogQuestionSchema, CatalogAnswerSchema, CatalogIcebreakerSchema],
      providers: [MikroOrmQuestionRepository, MikroOrmIcebreakerRepository],
    });
    questions = module.get(MikroOrmQuestionRepository);
    icebreakers = module.get(MikroOrmIcebreakerRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  it('testReadsQuestionsByIdWithAnswersInFileOrder', async () => {
    const question = aQuestion(['thrifty', 'chaotic', 'loyal', 'romantic']);
    await questions.upsert([question]);

    expect(await questions.byIds([question.id])).toEqual([question]);
  });

  it('testListsQuestionsOrderedById', async () => {
    const later = aQuestion(undefined, `q-zz-${Date.now()}`);
    const earlier = aQuestion(undefined, `q-aa-${Date.now()}`);
    await questions.upsert([later, earlier]);

    const ids = (await questions.all()).map((question) => question.id);

    expect(ids).toEqual([...ids].sort());
    expect(ids.indexOf(earlier.id)).toBeLessThan(ids.indexOf(later.id));
  });

  it('testByIdsReturnsOnlyExistingQuestions', async () => {
    const question = aQuestion();
    await questions.upsert([question]);

    expect(await questions.byIds([question.id, 'q-does-not-exist'])).toEqual([question]);
    expect(await questions.byIds([])).toEqual([]);
  });

  it('testUpsertUpdatesAnEditedQuestionAndKeepsMissingOnes', async () => {
    const edited = aQuestion();
    const kept = aQuestion();
    await questions.upsert([edited, kept]);

    const newText = {
      ...edited,
      text: 'Edited text',
      answers: edited.answers.map((a) => ({ ...a, text: `${a.text}!` })),
    };
    await questions.upsert([newText]);

    expect(await questions.byIds([edited.id, kept.id])).toEqual(expect.arrayContaining([newText, kept]));
  });

  it('testListsIcebreakersOrderedByIdAndUpserts', async () => {
    const icebreaker = anIcebreaker(['humorous']);
    await icebreakers.upsert([icebreaker]);
    await icebreakers.upsert([{ ...icebreaker, text: 'Edited', traits: ['humorous', 'curious'] }]);

    const all = await icebreakers.all();
    const ids = all.map((found) => found.id);

    expect(ids).toEqual([...ids].sort());
    expect(all.find((found) => found.id === icebreaker.id)).toEqual({
      ...icebreaker,
      text: 'Edited',
      traits: ['humorous', 'curious'],
    });
  });
});
