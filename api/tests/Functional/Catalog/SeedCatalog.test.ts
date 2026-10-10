import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { INestApplication } from '@nestjs/common';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import {
  DEFAULT_ICEBREAKERS_FILE,
  DEFAULT_QUESTIONS_FILE,
  InvalidCatalogFile,
  readCatalogFiles,
} from '@Huemans/Catalog/Infrastructure/Cli/CatalogFiles';
import { bootFunctional } from '../../Support/functional';

// Seeds the real tools/ files. Other suites add fixtures with random ids, so checks look at the file's ids only.
describe('Seeding the catalog from the content files', () => {
  let app: INestApplication;
  let catalog: CatalogService;

  beforeAll(async () => {
    app = await bootFunctional();
    catalog = app.get(CatalogService);
  });

  afterAll(async () => {
    await app.close();
  });

  async function seedFiles(questionsPath = DEFAULT_QUESTIONS_FILE): Promise<void> {
    const { questions, icebreakers } = readCatalogFiles(questionsPath, DEFAULT_ICEBREAKERS_FILE);
    await catalog.seed(questions, icebreakers);
  }

  it('testSeedsEveryQuestionAndIcebreakerOfTheFilesTwice', async () => {
    const { questions, icebreakers } = readCatalogFiles(DEFAULT_QUESTIONS_FILE, DEFAULT_ICEBREAKERS_FILE);
    expect(questions).toHaveLength(50);
    expect(icebreakers).toHaveLength(51);

    for (let run = 0; run < 2; run++) {
      await seedFiles();

      const selection = await catalog.questionsByIds(questions.map((question) => question.id));
      expect(selection.missing).toEqual([]);
      expect(selection.questions).toEqual(questions);
      expect(selection.questions.every((question) => question.answers.length === 4)).toBe(true);

      const fileIds = new Set(icebreakers.map((icebreaker) => icebreaker.id));
      expect((await catalog.icebreakers()).filter((icebreaker) => fileIds.has(icebreaker.id))).toEqual(icebreakers);
    }
  });

  it('testInvalidFileNamesTheEntryAndWritesNothing', async () => {
    const questions = JSON.parse(readFileSync(DEFAULT_QUESTIONS_FILE, 'utf8')) as {
      id: string;
      answers: { trait: string }[];
    }[];
    const newId = `q-invalid-${Date.now()}`;
    const invalid = [...questions, { ...questions[0], id: newId }];
    invalid[2].answers[1].trait = 'grumpy';
    const path = join(mkdtempSync(join(tmpdir(), 'catalog-')), 'questions.json');
    writeFileSync(path, JSON.stringify(invalid));

    await expect(seedFiles(path)).rejects.toThrow(InvalidCatalogFile);
    await expect(seedFiles(path)).rejects.toThrow(/q0003 answers\.1\.trait/);
    expect((await catalog.questionsByIds([newId])).missing).toEqual([newId]);
  });
});
