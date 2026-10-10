import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../../contracts/event';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { bootFunctional, getJson, postJson } from '../../Support/functional';

describe('GET /events/:eventId', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootFunctional();
  });

  afterAll(async () => {
    await app.close();
  });

  it('testReadsACreatedEvent', async () => {
    const created = (await postJson(app, '/events', { name: 'Demo night' })).body as EventResponse;

    const response = await getJson(app, `/events/${created.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(created);
  });

  it('testUnknownEventIsNotFound', async () => {
    expect((await getJson(app, `/events/${EventId.random().value}`)).status).toBe(404);
  });

  it('testMalformedIdIsBadRequest', async () => {
    expect((await getJson(app, '/events/3b241101-e2bb-4255-8caf-4136c566a962')).status).toBe(400);
  });
});
