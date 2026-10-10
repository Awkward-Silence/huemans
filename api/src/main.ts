import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
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
