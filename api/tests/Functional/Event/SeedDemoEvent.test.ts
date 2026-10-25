import { MikroORM } from '@mikro-orm/postgresql';
import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../contracts/event';
import type { RoomResponse } from '../../../contracts/room';
import { EventCreated } from '@Huemans/Event/Domain/EventCreated';
import { DEMO_EVENT_ID, DemoEventSeeder } from '@Huemans/Event/Infrastructure/Seed/DemoEventSeeder';
import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { recordPublished } from '../../Support/events';
import { bootFunctional, getJson } from '../../Support/functional';

describe('Seeding the demo event', () => {
  let app: INestApplication;
  let seeder: DemoEventSeeder;
  let published: DomainEvent[];

  beforeAll(async () => {
    app = await bootFunctional();
    seeder = app.get(DemoEventSeeder);
    published = recordPublished(app, EventCreated.EVENT_NAME);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // The demo id is fixed, so a previous run (or `pnpm seed:demo` on the test database) may have left it behind.
    const connection = app.get(MikroORM).em.getConnection();
    await connection.execute('delete from "assignments" where "event_id" = ?', [DEMO_EVENT_ID]);
    await connection.execute('delete from "event_distributions" where "event_id" = ?', [DEMO_EVENT_ID]);
    await connection.execute('delete from "events" where "id" = ?', [DEMO_EVENT_ID]);
    published.length = 0;
  });

  it('testCreatesTheDemoEventOpenWithAnEmptyRoom', async () => {
    await seeder.seed();

    const event = await getJson(app, `/events/${DEMO_EVENT_ID}`);
    expect(event.status).toBe(200);
    expect(event.body).toMatchObject({
      id: DEMO_EVENT_ID,
      name: 'Demo night',
      status: 'open',
    } satisfies Partial<EventResponse>);

    const room = await getJson(app, `/events/${DEMO_EVENT_ID}/room`);
    expect(room.status).toBe(200);
    expect((room.body as RoomResponse).groups.map((group) => group.count)).toEqual([0, 0, 0, 0]);
  });

  it('testSeedingTwiceChangesNothing', async () => {
    await seeder.seed();
    await seeder.seed();

    expect(published.map((event) => event.aggregateId)).toEqual([DEMO_EVENT_ID]);
    const event = await getJson(app, `/events/${DEMO_EVENT_ID}`);
    expect(event.body).toMatchObject({ name: 'Demo night', status: 'open' });
  });
});
