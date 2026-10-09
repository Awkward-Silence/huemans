import { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../apps/api/src/app.module';
import { configureApp } from '../../apps/api/src/configureApp';

export async function bootFunctional(
  options: { controllers?: Type[]; overrides?: { provide: Type; useValue: unknown }[] } = {},
): Promise<INestApplication> {
  let builder = Test.createTestingModule({ imports: [AppModule], controllers: options.controllers ?? [] });
  for (const override of options.overrides ?? []) {
    builder = builder.overrideProvider(override.provide).useValue(override.useValue);
  }
  const app = configureApp((await builder.compile()).createNestApplication());
  await app.init();
  return app;
}

export function getJson(app: INestApplication, path: string): request.Test {
  return request(app.getHttpServer() as App)
    .get(path)
    .set('Accept', 'application/json');
}

export function postJson(app: INestApplication, path: string, body: object): request.Test {
  return request(app.getHttpServer() as App)
    .post(path)
    .set('Accept', 'application/json')
    .send(body);
}
