import { INestApplication } from '@nestjs/common';
import type { EventDistributionView } from '../../../../contracts/colorDistribution';
import type { EventResponse } from '../../../../contracts/event';
import { EventCreated } from '@Huemans/Event/Domain/EventCreated';
import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { recordPublished } from '../../Support/events';
import { bootFunctional, getJson, postJson } from '../../Support/functional';

describe('Creating an event announces it', () => {
  let app: INestApplication;
  let published: DomainEvent[];

  beforeAll(async () => {
    app = await bootFunctional();
    published = recordPublished(app, EventCreated.EVENT_NAME);
  });

  afterAll(async () => {
    await app.close();
  });

  it('testPublishesEventCreatedOnceAndOpensTheDistribution', async () => {
    const created = (await postJson(app, '/events', { name: 'Demo night' })).body as EventResponse;

    expect(published.map((event) => event.aggregateId)).toEqual([created.id]);

    const distribution = await getJson(app, `/events/${created.id}/distribution`);
    expect(distribution.status).toBe(200);
    expect((distribution.body as EventDistributionView).groups).toEqual(
      ['amber', 'coral', 'teal', 'violet'].map((color) => ({ color, members: 0, personalityTypes: [] })),
    );
  });
});
