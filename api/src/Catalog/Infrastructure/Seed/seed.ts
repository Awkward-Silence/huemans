import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@Huemans/app.module';
import { DEFAULT_CATALOG_FILES, readCatalogFiles } from './CatalogFiles';
import { MikroOrmCatalogSeeder } from './MikroOrmCatalogSeeder';

// Usage: pnpm catalog:seed [questions.json] [icebreakers.json] [profiles.json] [trait-types.json]
async function main(): Promise<void> {
  const [
    questions = DEFAULT_CATALOG_FILES.questions,
    icebreakers = DEFAULT_CATALOG_FILES.icebreakers,
    profiles = DEFAULT_CATALOG_FILES.profiles,
    mapping = DEFAULT_CATALOG_FILES.mapping,
  ] = process.argv.slice(2);
  const content = readCatalogFiles({
    questions: resolve(questions),
    icebreakers: resolve(icebreakers),
    profiles: resolve(profiles),
    mapping: resolve(mapping),
  });

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    await app.get(MikroOrmCatalogSeeder).seed(content);
  } finally {
    await app.close();
  }
  console.log(
    `Seeded ${content.questions.length} questions, ${content.icebreakers.length} icebreakers, ` +
      `${content.profiles.length} profiles and ${Object.keys(content.mapping).length} mapped traits.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
