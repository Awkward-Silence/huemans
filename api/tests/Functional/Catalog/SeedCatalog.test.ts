import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { INestApplication } from '@nestjs/common';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import {
  DEFAULT_CATALOG_FILES,
  InvalidCatalogContent,
  readCatalogFiles,
} from '@Huemans/Catalog/Infrastructure/Seed/CatalogFiles';
import { MikroOrmCatalogSeeder } from '@Huemans/Catalog/Infrastructure/Seed/MikroOrmCatalogSeeder';
import { bootFunctional } from '../../Support/functional';

// Seeds the real tools/ files. Other suites add questions and icebreakers with random ids, so checks look at the files' ids.
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

  function withEdited<T>(
    file: keyof typeof DEFAULT_CATALOG_FILES,
    edit: (json: T) => void,
  ): typeof DEFAULT_CATALOG_FILES {
    const json = JSON.parse(readFileSync(DEFAULT_CATALOG_FILES[file], 'utf8')) as T;
    edit(json);
    const path = join(mkdtempSync(join(tmpdir(), 'catalog-')), `${file}.json`);
    writeFileSync(path, JSON.stringify(json));
    return { ...DEFAULT_CATALOG_FILES, [file]: path };
  }

  async function seed(paths = DEFAULT_CATALOG_FILES): Promise<void> {
    await app.get(MikroOrmCatalogSeeder).seed(readCatalogFiles(paths));
  }

  it('testSeedsAllFourFilesTwiceWithTheSameResult', async () => {
    const content = readCatalogFiles(DEFAULT_CATALOG_FILES);
    expect(content.questions).toHaveLength(50);
    expect(content.icebreakers).toHaveLength(51);
    expect(content.profiles).toHaveLength(4);

    for (let run = 0; run < 2; run++) {
      await seed();

      const questionIds = new Set(content.questions.map((question) => question.id));
      const questions = (await catalog.allQuestions()).filter((question) => questionIds.has(question.id));
      expect(questions).toHaveLength(50);
      expect(questions.every((question) => question.answers.length === 4)).toBe(true);
      expect(questions.find((question) => question.id === 'q0001')?.text).toBe(content.questions[0].text);

      const icebreakerIds = new Set(content.icebreakers.map((icebreaker) => icebreaker.id));
      expect((await catalog.allIcebreakers()).filter((icebreaker) => icebreakerIds.has(icebreaker.id))).toHaveLength(
        51,
      );

      for (const profile of content.profiles) {
        expect(await catalog.profileOf(profile.type)).toEqual(profile);
      }
      expect(await catalog.mapping()).toEqual(content.mapping);
    }
  });

  it('testInvalidQuestionNamesTheEntryAndWritesNothing', async () => {
    const newId = `q-invalid-${Date.now()}`;
    const paths = withEdited('questions', (questions: { id: string; answers: { trait: string }[] }[]) => {
      questions.push({ ...questions[0], id: newId });
      questions[2].answers[1].trait = 'grumpy';
    });

    await expect(seed(paths)).rejects.toThrow(InvalidCatalogContent);
    await expect(seed(paths)).rejects.toThrow(/q0003 answers\.1\.trait/);
    expect((await catalog.allQuestions()).some((question) => question.id === newId)).toBe(false);
  });

  it('testChipMappedToAnotherTypeNamesTheProfileAndWritesNothing', async () => {
    const newId = `q-chip-${Date.now()}`;
    const paths = {
      ...withEdited('profiles', (profiles: { type: string; traits: string[] }[]) => {
        profiles.find((profile) => profile.type === 'planner')!.traits[0] = 'curious';
      }),
      questions: withEdited('questions', (questions: { id: string }[]) => {
        questions.push({ ...questions[0], id: newId });
      }).questions,
    };

    await expect(seed(paths)).rejects.toThrow(/planner chip curious is mapped to explorer/);
    expect((await catalog.allQuestions()).some((question) => question.id === newId)).toBe(false);
    expect((await catalog.profileOf('planner')).traits).not.toContain('curious');
  });
});
