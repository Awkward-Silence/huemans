import { INestApplication } from '@nestjs/common';
import type { EventResponse } from '../../../../contracts/event';
import type { RoomResponse } from '../../../../contracts/room';
import { EventCreated } from '@Huemans/Event/Domain/EventCreated';
import { QuestionnaireCompleted } from '@Huemans/Shared/Domain/Event/QuestionnaireCompleted';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { publish } from '../../Support/events';
import { bootFunctional, getJson, postJson } from '../../Support/functional';

describe('GET /events/:eventId/room', () => {
  let app: INestApplication;
  let eventId: string;

  beforeAll(async () => {
    app = await bootFunctional();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const created = await postJson(app, '/events', { name: 'Room night' });
    eventId = (created.body as EventResponse).id;
  });

  function completeQuestionnaire(event: string, traits: string[]): QuestionnaireCompleted {
    return new QuestionnaireCompleted(AttendeeId.random().value, event, traits);
  }

  it('testNewEventHasAnEmptyRoom', async () => {
    const response = await getJson(app, `/events/${eventId}/room`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      eventId,
      total: 0,
      answered: 0,
      groups: [
        { color: 'amber', count: 0 },
        { color: 'coral', count: 0 },
        { color: 'teal', count: 0 },
        { color: 'violet', count: 0 },
      ],
    } satisfies RoomResponse);
  });

  it('testRoomCountsGroupedAttendees', async () => {
    await publish(
      app,
      completeQuestionnaire(eventId, ['curious', 'adventurous', 'organized']),
      completeQuestionnaire(eventId, ['sociable']),
      completeQuestionnaire(eventId, ['organized', 'organized', 'sociable']),
    );

    const response = await getJson(app, `/events/${eventId}/room`);

    expect(response.status).toBe(200);
    const room = response.body as RoomResponse;
    expect(room.answered).toBe(3);
    expect(room.groups).toEqual([
      { color: 'amber', count: 1 },
      { color: 'coral', count: 1 },
      { color: 'teal', count: 1 },
      { color: 'violet', count: 0 },
    ]);
  });

  it('testRoomOnlyCountsTheRequestedEvent', async () => {
    const otherEventId = EventId.random().value;
    await publish(app, new EventCreated(otherEventId), completeQuestionnaire(otherEventId, ['sociable']));

    const response = await getJson(app, `/events/${eventId}/room`);

    expect((response.body as RoomResponse).answered).toBe(0);
  });

  it('testTotalEqualsAnsweredUntilParticipationRecordsJoins', async () => {
    await publish(app, completeQuestionnaire(eventId, ['sociable']), completeQuestionnaire(eventId, ['curious']));

    const response = await getJson(app, `/events/${eventId}/room`);

    expect(response.body).toMatchObject({ total: 2, answered: 2 });
  });

  it('testUnknownEventIsNotFound', async () => {
    const response = await getJson(app, `/events/${EventId.random().value}/room`);

    expect(response.status).toBe(404);
  });

  it('testMalformedEventIdIsBadRequest', async () => {
    const response = await getJson(app, '/events/not-a-uuid/room');

    expect(response.status).toBe(400);
  });
});
