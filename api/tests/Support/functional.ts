import { INestApplication, InjectionToken, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@Huemans/app.module';
import { configureApp } from '@Huemans/configureApp';

export async function bootFunctional(
  options: { controllers?: Type[]; overrides?: { provide: InjectionToken; useValue: unknown }[] } = {},
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

/** Joins the event through the API, as a phone does before answering, and returns the new attendee id. */
export async function joinAttendee(app: INestApplication, eventId: string, name = 'Ana'): Promise<string> {
  const response = await postJson(app, `/events/${eventId}/attendees`, { name });
  if (response.status !== 201) {
    throw new Error(`Joining event <${eventId}> answered ${response.status}`);
  }
  return (response.body as { attendeeId: string }).attendeeId;
}
