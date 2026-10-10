import { INestApplication } from '@nestjs/common';
import { EventCreated } from '@Huemans/Event/Domain/EventCreated';
import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { InMemoryEventDispatcher } from '@Huemans/Shared/Infrastructure/EventDispatcher/InMemoryEventDispatcher';
import { recordPublished } from '../../Support/events';
import { bootFunctional, getJson, postJson } from '../../Support/functional';

describe('Creating an event when a subscriber fails', () => {
  let app: INestApplication;
  let published: DomainEvent[];

  beforeAll(async () => {
    app = await bootFunctional();
    published = recordPublished(app, EventCreated.EVENT_NAME);
    app.get(InMemoryEventDispatcher).subscribe(EventCreated.EVENT_NAME, () => Promise.reject(new Error('boom')));
  });

  afterAll(async () => {
    await app.close();
  });

  it('testStoresNeitherTheEventNorItsDistribution', async () => {
    expect((await postJson(app, '/events', { name: 'Demo night' })).status).toBe(500);

    const [created] = published;
    expect((await getJson(app, `/events/${created.aggregateId}`)).status).toBe(404);
    expect((await getJson(app, `/events/${created.aggregateId}/distribution`)).status).toBe(404);
  });
});
