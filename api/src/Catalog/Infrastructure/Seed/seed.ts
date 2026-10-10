import { NestFactory } from '@nestjs/core';
import { ApplicationService, SeedResult } from '@Huemans/Catalog/Application/ApplicationService';
import { contentFilesFrom } from './contentFilesFrom';
import { CatalogSeedModule } from './CatalogSeedModule';

// Usage: pnpm catalog:seed [questions.json] [icebreakers.json] [profiles.json] [trait-types.json]
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(CatalogSeedModule.forFiles(contentFilesFrom(process.argv)), {
    logger: ['error', 'warn'],
  });
  let result: SeedResult;
  try {
    result = await app.get(ApplicationService).seed();
  } finally {
    await app.close();
  }
  if (!result.seeded) {
    console.log(`Catalog already seeded at ${result.seededAt?.toISOString()}; nothing written.`);
    return;
  }
  const { questions, icebreakers, profiles, mappedTraits } = result.counts;
  console.log(
    `Seeded ${questions} questions, ${icebreakers} icebreakers, ${profiles} profiles and ${mappedTraits} mapped traits.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
