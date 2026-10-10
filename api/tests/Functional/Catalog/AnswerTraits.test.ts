import { INestApplication } from '@nestjs/common';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import { aQuestion, seedCatalog } from '../../Support/catalog';
import { bootFunctional } from '../../Support/functional';

describe('Catalog answer traits', () => {
  let app: INestApplication;
  let catalog: CatalogService;

  beforeAll(async () => {
    app = await bootFunctional();
    catalog = app.get(CatalogService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('testResolvesChosenAnswersInOrderWithRepeats', async () => {
    const first = aQuestion(['dramatic', 'curious', 'practical', 'optimistic']);
    const second = aQuestion(['loyal', 'chaotic', 'thrifty', 'romantic']);
    await seedCatalog(app, [first, second]);

    const traits = await catalog.traitsOf([
      { questionId: first.id, answerId: `${first.id}-c` },
      { questionId: second.id, answerId: `${second.id}-a` },
      { questionId: first.id, answerId: `${first.id}-c` },
    ]);

    expect(traits).toEqual(['practical', 'loyal', 'practical']);
  });

  it('testIgnoresUnknownAndMismatchedChoices', async () => {
    const first = aQuestion(['dramatic', 'curious', 'practical', 'optimistic']);
    const second = aQuestion(['loyal', 'chaotic', 'thrifty', 'romantic']);
    await seedCatalog(app, [first, second]);

    const traits = await catalog.traitsOf([
      { questionId: first.id, answerId: `${first.id}-c` },
      { questionId: first.id, answerId: `${second.id}-a` },
      { questionId: 'q-unknown', answerId: 'q-unknown-a' },
      { questionId: second.id, answerId: `${second.id}-z` },
    ]);

    expect(traits).toEqual(['practical']);
  });

  it('testReadsSelectedQuestionsInOrderAndReportsMissing', async () => {
    const first = aQuestion();
    const second = aQuestion();
    await seedCatalog(app, [first, second]);

    const selection = await catalog.questionsByIds([second.id, 'q-unknown', first.id]);

    expect(selection.questions).toEqual([second, first]);
    expect(selection.missing).toEqual(['q-unknown']);
  });
});
