import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../contracts/event';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { bootFunctional, getJson, postJson } from '../../Support/functional';

describe('POST /events/:eventId/reveal', () => {
  let app: INestApplication;
  let event: EventResponse;

  beforeAll(async () => {
    app = await bootFunctional();
  });

  beforeEach(async () => {
    event = (await postJson(app, '/events', { name: 'Demo night' })).body as EventResponse;
  });

  afterAll(async () => {
    await app.close();
  });

  it('testRevealsAnOpenEvent', async () => {
    const response = await postJson(app, `/events/${event.id}/reveal`, {});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...event, status: 'revealed' });
    expect((await getJson(app, `/events/${event.id}`)).body).toEqual({ ...event, status: 'revealed' });
  });

  it('testSecondRevealIsANoOp', async () => {
    await postJson(app, `/events/${event.id}/reveal`, {});

    const response = await postJson(app, `/events/${event.id}/reveal`, {});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...event, status: 'revealed' });
  });

  it('testUnknownEventIsNotFound', async () => {
    expect((await postJson(app, `/events/${EventId.random().value}/reveal`, {})).status).toBe(404);
  });

  it('testMalformedIdIsBadRequest', async () => {
    expect((await postJson(app, '/events/not-a-uuid/reveal', {})).status).toBe(400);
  });
});
