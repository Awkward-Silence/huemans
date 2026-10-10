import { EntityManager } from '@mikro-orm/postgresql';
import { TestingModule } from '@nestjs/testing';
import { CatalogSeedSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogSeedSchema';
import { MikroOrmCatalogSeedRecord } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/MikroOrmCatalogSeedRecord';
import { bootIntegration } from '../../../../Support/integration';

// The shared test database is already seeded, so each test works on a fork whose transaction it rolls back.
describe('MikroOrmCatalogSeedRecord', () => {
  let module: TestingModule;
  let em: EntityManager;
  let seedRecord: MikroOrmCatalogSeedRecord;
  let seededAt: Date;

  beforeAll(async () => {
    module = await bootIntegration({ entities: [CatalogSeedSchema] });
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    em = module.get(EntityManager).fork();
    await em.begin();
    await em.nativeDelete(CatalogSeedSchema, {});
    seedRecord = new MikroOrmCatalogSeedRecord(em);
    seededAt = new Date('2026-10-11T10:00:00Z');
  });

  afterEach(async () => {
    await em.rollback();
  });

  it('testTheFirstMarkWins', async () => {
    expect(await seedRecord.markSeeded(seededAt)).toBe(true);
    expect(await seedRecord.markSeeded(new Date('2026-10-12T10:00:00Z'))).toBe(false);
    expect(await seedRecord.seededAt()).toEqual(seededAt);
  });

  it('testAnUnseededDatabaseHasNoSeedTime', async () => {
    expect(await seedRecord.seededAt()).toBeNull();
  });

  it('testARolledBackMarkLeavesNoRecord', async () => {
    const failedSeed = em.transactional(async (transaction) => {
      await new MikroOrmCatalogSeedRecord(transaction).markSeeded(seededAt);
      throw new Error('a later write failed');
    });

    await expect(failedSeed).rejects.toThrow('a later write failed');

    expect(await seedRecord.seededAt()).toBeNull();
  });
});
