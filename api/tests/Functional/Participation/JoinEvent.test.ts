import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../contracts/event';
import type { JoinResponse } from '../../../contracts/participation';
import { AttendeeJoined } from '@Huemans/Participation/Domain/AttendeeJoined';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { recordPublished } from '../../Support/events';
import { bootFunctional, postJson } from '../../Support/functional';

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('POST /events/:eventId/attendees', () => {
  let app: INestApplication;
  let eventId: string;

  beforeAll(async () => {
    app = await bootFunctional();
  });

  beforeEach(async () => {
    eventId = ((await postJson(app, '/events', { name: 'Demo night' })).body as EventResponse).id;
  });

  afterAll(async () => {
    await app.close();
  });

  function join(body: object, event = eventId) {
    return postJson(app, `/events/${event}/attendees`, body);
  }

  it('testJoiningReturnsANewAttendeeId', async () => {
    const response = await join({ name: 'Ana' });

    expect(response.status).toBe(201);
    expect((response.body as JoinResponse).attendeeId).toMatch(UUID_V7);
  });

  it('testJoiningPublishesAttendeeJoined', async () => {
    const published = recordPublished(app, AttendeeJoined.EVENT_NAME);

    const { attendeeId } = (await join({ name: 'Ana' })).body as JoinResponse;

    expect(published.map((event) => (event as AttendeeJoined).toPrimitives())).toContainEqual({ eventId, attendeeId });
  });

  it('testTheSameNameJoinsTwiceAsTwoAttendees', async () => {
    const first = (await join({ name: 'Ana' })).body as JoinResponse;
    const second = (await join({ name: 'Ana' })).body as JoinResponse;

    expect(first.attendeeId).not.toBe(second.attendeeId);
  });

  it('testJoiningStaysOpenAfterTheReveal', async () => {
    await postJson(app, `/events/${eventId}/reveal`, {});

    expect((await join({ name: 'Late Luis' })).status).toBe(201);
  });

  it.each([[{ name: '' }], [{ name: '   ' }], [{ name: 'a'.repeat(41) }], [{}], [{ name: 7 }]])(
    'testAnInvalidNameIsBadRequest %p',
    async (body) => {
      expect((await join(body)).status).toBe(400);
    },
  );

  it('testUnknownEventIsNotFound', async () => {
    expect((await join({ name: 'Ana' }, EventId.random().value)).status).toBe(404);
  });

  it('testMalformedEventIdIsBadRequest', async () => {
    expect((await join({ name: 'Ana' }, 'not-a-uuid')).status).toBe(400);
  });
});
