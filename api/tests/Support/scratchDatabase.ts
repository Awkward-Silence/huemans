import { randomUUID } from 'node:crypto';
import { MikroORM } from '@mikro-orm/postgresql';
import { mikroOrmConfig } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/mikro-orm.config';

export interface ScratchDatabase {
  url: string;
  drop(): Promise<void>;
}

/**
 * A database that was never seeded, created on the test server and migrated, for the scenarios the shared test
 * database (already seeded by whichever suite ran first) cannot show. Drop it in afterAll.
 */
export async function createScratchDatabase(): Promise<ScratchDatabase> {
  const testUrl = process.env.DATABASE_URL!;
  const name = `huemans_scratch_${randomUUID().replaceAll('-', '')}`;
  const url = testUrl.replace(/\/[^/]+$/, `/${name}`);

  await onTestServer(testUrl, `create database "${name}"`);
  const orm = await MikroORM.init(mikroOrmConfig({ clientUrl: url }));
  try {
    await orm.migrator.up();
  } finally {
    await orm.close();
  }

  return { url, drop: () => onTestServer(testUrl, `drop database if exists "${name}" with (force)`) };
}

/** Runs `work` with DATABASE_URL pointing at `url`, for modules that read it when they are built. */
export async function withDatabaseUrl<T>(url: string, work: () => Promise<T>): Promise<T> {
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL = url;
  try {
    return await work();
  } finally {
    process.env.DATABASE_URL = previous;
  }
}

async function onTestServer(testUrl: string, sql: string): Promise<void> {
  const orm = await MikroORM.init(mikroOrmConfig({ clientUrl: testUrl, entities: [], entitiesTs: [] }));
  try {
    await orm.em.getConnection().execute(sql);
  } finally {
    await orm.close();
  }
}
