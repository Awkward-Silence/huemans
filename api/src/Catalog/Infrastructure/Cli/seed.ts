import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@Huemans/app.module';
import { ApplicationService } from '@Huemans/Catalog/Application/ApplicationService';
import { DEFAULT_ICEBREAKERS_FILE, DEFAULT_QUESTIONS_FILE, readCatalogFiles } from './CatalogFiles';

// Usage: pnpm catalog:seed [questions.json] [icebreakers.json]
async function main(): Promise<void> {
  const [questionsPath = DEFAULT_QUESTIONS_FILE, icebreakersPath = DEFAULT_ICEBREAKERS_FILE] = process.argv.slice(2);
  const { questions, icebreakers } = readCatalogFiles(resolve(questionsPath), resolve(icebreakersPath));

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    await app.get(ApplicationService).seed(questions, icebreakers);
  } finally {
    await app.close();
  }
  console.log(`Seeded ${questions.length} questions and ${icebreakers.length} icebreakers.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
