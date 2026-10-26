import { existsSync } from 'node:fs';

// Like Symfony: .env.local (git-ignored, for secrets) wins over .env, and real environment variables win over both,
// because loadEnvFile never overrides a variable that is already set.
for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';
import { configureApp } from './configureApp';

async function bootstrap(): Promise<void> {
  const app = configureApp(await NestFactory.create(AppModule));
  await app.listen(config.port);
}

void bootstrap();
