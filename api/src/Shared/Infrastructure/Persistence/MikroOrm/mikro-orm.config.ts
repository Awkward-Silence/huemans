import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, Options, PostgreSqlDriver } from '@mikro-orm/postgresql';

export function mikroOrmConfig(overrides: Options = {}): Options {
  return defineConfig({
    driver: PostgreSqlDriver,
    clientUrl: process.env.DATABASE_URL,
    entities: ['./dist/**/Infrastructure/Persistence/MikroOrm/*Schema.js'],
    entitiesTs: ['./src/**/Infrastructure/Persistence/MikroOrm/*Schema.ts'],
    discovery: { warnWhenNoEntities: false },
    extensions: [Migrator],
    migrations: { path: './migrations', pathTs: './migrations', snapshot: false },
    ...overrides,
  });
}

export default mikroOrmConfig();
