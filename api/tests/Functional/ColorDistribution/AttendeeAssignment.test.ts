import { INestApplication } from '@nestjs/common';
import type { AttendeeAssignment, AttendeePending } from '../../../../contracts/colorDistribution';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { EventCreated } from '@Huemans/Shared/Domain/Event/EventCreated';
import { QuestionnaireCompleted } from '@Huemans/Shared/Domain/Event/QuestionnaireCompleted';
import { publish } from '../../Support/events';
import { bootFunctional, getJson } from '../../Support/functional';

describe('GET /events/:eventId/attendees/:attendeeId/assignment', () => {
  let app: INestApplication;
  let eventId: string;
  let attendeeId: string;

  beforeAll(async () => {
    app = await bootFunctional();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    eventId = EventId.random().value;
    attendeeId = AttendeeId.random().value;
    await publish(app, new EventCreated(eventId));
  });

  it('testAssignedAttendeeReadsTheirGroup', async () => {
    await publish(app, new QuestionnaireCompleted(attendeeId, eventId, ['romantic', 'nostalgic', 'sociable']));

    const response = await getJson(app, `/events/${eventId}/attendees/${attendeeId}/assignment`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'assigned',
      eventId,
      attendeeId,
      color: 'amber',
      personalityType: 'dreamer',
    } satisfies AttendeeAssignment);
  });

  it('testAttendeeNotAssignedYet', async () => {
    const response = await getJson(app, `/events/${eventId}/attendees/${attendeeId}/assignment`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'pending' } satisfies AttendeePending);
  });

  it('testUnknownEventIsNotFound', async () => {
    const response = await getJson(app, `/events/${EventId.random().value}/attendees/${attendeeId}/assignment`);

    expect(response.status).toBe(404);
  });

  it('testInvalidAttendeeIdIsBadRequest', async () => {
    const response = await getJson(app, `/events/${eventId}/attendees/not-a-uuid/assignment`);

    expect(response.status).toBe(400);
  });
});
