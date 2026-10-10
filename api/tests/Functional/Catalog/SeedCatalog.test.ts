import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EntityManager } from '@mikro-orm/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService as CatalogService, SeedResult } from '@Huemans/Catalog/Application/ApplicationService';
import { IcebreakerAuthored } from '@Huemans/Catalog/Domain/Event/IcebreakerAuthored';
import { PersonalityTypesDefined } from '@Huemans/Catalog/Domain/Event/PersonalityTypesDefined';
import { QuestionAuthored } from '@Huemans/Catalog/Domain/Event/QuestionAuthored';
import { CATALOG_SEED_RECORD, CatalogSeedRecord } from '@Huemans/Catalog/Domain/Port/CatalogSeedRecord';
import { InvalidCatalogContent } from '@Huemans/Catalog/Infrastructure/Content/InvalidCatalogContent';
import {
  CatalogFilePaths,
  DEFAULT_CATALOG_FILES,
} from '@Huemans/Catalog/Infrastructure/Content/JsonCatalogContentSource';
import { CatalogSeedModule } from '@Huemans/Catalog/Infrastructure/Seed/CatalogSeedModule';
import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { InMemoryEventDispatcher } from '@Huemans/Shared/Infrastructure/EventDispatcher/InMemoryEventDispatcher';
import { realContent } from '../../Support/catalog';
import { createScratchDatabase, ScratchDatabase, withDatabaseUrl } from '../../Support/scratchDatabase';

const CATALOG_EVENTS = [QuestionAuthored.EVENT_NAME, IcebreakerAuthored.EVENT_NAME, PersonalityTypesDefined.EVENT_NAME];

// The shared test database is seeded by whichever suite runs first, so every scenario here gets a database that was
// never seeded.
describe('Seeding the catalog once per database', () => {
  jest.setTimeout(60_000);

  let scratch: ScratchDatabase;
  let catalog: (database: ScratchDatabase) => Promise<TestingModule>;
  let seed: (database: ScratchDatabase, paths?: CatalogFilePaths) => Promise<{ result: SeedResult; events: string[] }>;
  let withEdited: <T>(file: keyof CatalogFilePaths, edit: (json: T) => void) => CatalogFilePaths;

  beforeEach(async () => {
    scratch = await createScratchDatabase();
    catalog = (database) =>
      withDatabaseUrl(database.url, () =>
        Test.createTestingModule({ imports: [CatalogSeedModule.forFiles(DEFAULT_CATALOG_FILES)] }).compile(),
      );
    seed = async (database, paths = DEFAULT_CATALOG_FILES) => {
      const module = await withDatabaseUrl(database.url, () =>
        Test.createTestingModule({ imports: [CatalogSeedModule.forFiles(paths)] }).compile(),
      );
      const events: string[] = [];
      for (const name of CATALOG_EVENTS) {
        module.get(InMemoryEventDispatcher).subscribe(name, (event: DomainEvent) => {
          events.push(event.eventName);
          return Promise.resolve();
        });
      }
      try {
        return { result: await module.get(CatalogService).seed(), events };
      } finally {
        await module.close();
      }
    };
    withEdited = <T>(file: keyof CatalogFilePaths, edit: (json: T) => void) => {
      const json = JSON.parse(readFileSync(DEFAULT_CATALOG_FILES[file], 'utf8')) as T;
      edit(json);
      const path = join(mkdtempSync(join(tmpdir(), 'catalog-')), `${file}.json`);
      writeFileSync(path, JSON.stringify(json));
      return { ...DEFAULT_CATALOG_FILES, [file]: path };
    };
  });

  afterEach(async () => {
    await scratch.drop();
  });

  it('testTheFirstSeedLoadsAllContentAndRecordsWhen', async () => {
    const { result, events } = await seed(scratch);

    expect(result).toEqual({
      seeded: true,
      counts: { questions: 50, icebreakers: 51, profiles: 4, mappedTraits: 33 },
    });
    expect(events.filter((name) => name === QuestionAuthored.EVENT_NAME)).toHaveLength(50);
    expect(events.filter((name) => name === IcebreakerAuthored.EVENT_NAME)).toHaveLength(51);
    expect(events.filter((name) => name === PersonalityTypesDefined.EVENT_NAME)).toHaveLength(1);

    const module = await catalog(scratch);
    try {
      const service = module.get(CatalogService);
      expect(await service.allQuestions()).toEqual(realContent().questions);
      expect(await service.allIcebreakers()).toEqual(realContent().icebreakers);
      expect(await service.mapping()).toEqual(realContent().mapping);
      expect(await module.get<CatalogSeedRecord>(CATALOG_SEED_RECORD).seededAt()).toBeInstanceOf(Date);
    } finally {
      await module.close();
    }
  });

  it('testASecondSeedChangesNothingAndAnnouncesNothing', async () => {
    await seed(scratch);
    const module = await catalog(scratch);
    const firstSeededAt = await module.get<CatalogSeedRecord>(CATALOG_SEED_RECORD).seededAt();
    await module.close();
    const edited = withEdited('questions', (questions: { text: string }[]) => {
      questions[0].text = 'Edited after the seed';
    });

    const { result, events } = await seed(scratch, edited);

    expect(result).toEqual({ seeded: false, seededAt: firstSeededAt });
    expect(events).toEqual([]);
    const after = await catalog(scratch);
    try {
      expect((await after.get(CatalogService).allQuestions())[0].text).toBe(realContent().questions[0].text);
    } finally {
      await after.close();
    }
  });

  it('testInvalidContentWritesNothing', async () => {
    const invalid = withEdited('questions', (questions: { answers: { trait: string }[] }[]) => {
      questions[2].answers[1].trait = 'grumpy';
    });

    await expect(seed(scratch, invalid)).rejects.toThrow(InvalidCatalogContent);

    const module = await catalog(scratch);
    try {
      expect(await module.get(CatalogService).allQuestions()).toEqual([]);
      expect(await module.get<CatalogSeedRecord>(CATALOG_SEED_RECORD).seededAt()).toBeNull();
    } finally {
      await module.close();
    }
  });

  it('testAFailedWriteLeavesNoContentAndNoSeedRecord', async () => {
    // A row already holding the first icebreaker's id makes the seed fail after it has written the questions.
    const module = await catalog(scratch);
    await module
      .get(EntityManager)
      .getConnection()
      .execute(
        `insert into catalog_icebreakers (id, theme, text, traits) values ('i0001', 'food', 'Taken', '{curious}')`,
      );
    await module.close();

    const failed = seed(scratch);

    await expect(failed).rejects.toThrow();
    const after = await catalog(scratch);
    try {
      expect(await after.get(CatalogService).allQuestions()).toEqual([]);
      expect(await after.get<CatalogSeedRecord>(CATALOG_SEED_RECORD).seededAt()).toBeNull();
    } finally {
      await after.close();
    }
  });
});
