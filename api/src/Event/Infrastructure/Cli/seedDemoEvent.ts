import { NestFactory } from '@nestjs/core';
import { AppModule } from '@Huemans/app.module';
import { DemoEventSeeder } from '@Huemans/Event/Infrastructure/Seed/DemoEventSeeder';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const event = await app.get(DemoEventSeeder).seed();
    console.log(`Demo event ready: ${event.id} (${event.name}, ${event.status})`);
  } finally {
    await app.close();
  }
}

void main();
