import { INestApplication } from '@nestjs/common';
import type { AttendeeGrouped as AttendeeGroupedPayload } from '../../../../contracts/colorDistribution';
import { AttendeeGrouped } from '@Huemans/ColorDistribution/Domain/AttendeeGrouped';
import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { EventCreated } from '@Huemans/Shared/Domain/Event/EventCreated';
import { QuestionnaireCompleted } from '@Huemans/Shared/Domain/Event/QuestionnaireCompleted';
import { publish, recordPublished } from '../../Support/events';
import { bootFunctional, getJson } from '../../Support/functional';

describe('Color distribution flow', () => {
  let app: INestApplication;
  let grouped: DomainEvent[];
  let eventId: string;
  let attendees: string[];

  beforeAll(async () => {
    app = await bootFunctional();
    grouped = recordPublished(app, AttendeeGrouped.EVENT_NAME);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    eventId = EventId.random().value;
    attendees = Array.from({ length: 5 }, () => AttendeeId.random().value);
  });

  async function assignmentOf(attendeeId: string): Promise<unknown> {
    return (await getJson(app, `/events/${eventId}/attendees/${attendeeId}/assignment`)).body;
  }

  it('testGroupsEveryAttendeeOnceAndAnnouncesIt', async () => {
    const [ana, bea, carla, dani, eva] = attendees;

    await publish(app, new EventCreated(eventId));
    await publish(
      app,
      new QuestionnaireCompleted(ana, eventId, ['curious', 'adventurous']),
      new QuestionnaireCompleted(bea, eventId, ['spontaneous']),
      new QuestionnaireCompleted(carla, eventId, ['organized', 'practical', 'curious']),
      new QuestionnaireCompleted(dani, eventId, ['sociable']),
      // Ana submits again with different answers: her first assignment stands.
      new QuestionnaireCompleted(ana, eventId, ['romantic']),
    );
    // Color Distribution has no notion of the icebreaker reveal: a late completion is grouped like any other.
    await publish(app, new QuestionnaireCompleted(eva, eventId, ['independent']));
    // A repeated EventCreated must not reset the distribution.
    await publish(app, new EventCreated(eventId));

    expect(await assignmentOf(ana)).toEqual({
      status: 'assigned',
      eventId,
      attendeeId: ana,
      color: 'amber',
      personalityType: 'explorer',
    });
    expect(await assignmentOf(bea)).toEqual({
      status: 'assigned',
      eventId,
      attendeeId: bea,
      color: 'coral',
      personalityType: 'explorer',
    });
    expect(await assignmentOf(carla)).toEqual({
      status: 'assigned',
      eventId,
      attendeeId: carla,
      color: 'teal',
      personalityType: 'planner',
    });
    expect(await assignmentOf(dani)).toEqual({
      status: 'assigned',
      eventId,
      attendeeId: dani,
      color: 'violet',
      personalityType: 'connector',
    });
    expect(await assignmentOf(eva)).toEqual({
      status: 'assigned',
      eventId,
      attendeeId: eva,
      color: 'teal',
      personalityType: 'explorer',
    });

    const distribution = await getJson(app, `/events/${eventId}/distribution`);
    expect((distribution.body as { groups: { members: number }[] }).groups.map((group) => group.members)).toEqual([
      1, 1, 2, 1,
    ]);

    const announced = grouped.filter((event) => event.aggregateId === eventId);
    expect(announced.map((event) => (event.toPrimitives() as AttendeeGroupedPayload).attendeeId).sort()).toEqual(
      [...attendees].sort(),
    );
  });
});
