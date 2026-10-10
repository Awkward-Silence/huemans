import { MikroORM, Options } from '@mikro-orm/postgresql';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mikroOrmConfig } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/mikro-orm.config';

export async function bootIntegration(options: {
  entities?: Options['entities'];
  providers?: Provider[];
}): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [
      MikroOrmModule.forRoot(
        mikroOrmConfig({
          entities: options.entities ?? [],
          entitiesTs: options.entities ?? [],
          allowGlobalContext: true,
        }),
      ),
    ],
    providers: options.providers ?? [],
  }).compile();
}

export async function clearDatabase(module: TestingModule): Promise<void> {
  const orm = module.get(MikroORM);
  await orm.schema.clearDatabase();
  orm.em.clear();
}
