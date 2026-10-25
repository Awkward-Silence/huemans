import { Attendee } from '@Huemans/Participation/Domain/Attendee';
import { AttendeeJoined } from '@Huemans/Participation/Domain/AttendeeJoined';
import { AttendeeName } from '@Huemans/Participation/Domain/ValueObject/AttendeeName';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

describe('Attendee', () => {
  let id: AttendeeId;
  let eventId: EventId;
  let joinedAt: Date;
  let attendee: Attendee;

  beforeEach(() => {
    id = AttendeeId.random();
    eventId = EventId.random();
    joinedAt = new Date('2026-10-25T20:00:00.000Z');
    attendee = Attendee.join(id, eventId, new AttendeeName('Ana'), joinedAt);
  });

  it('testJoiningRecordsAttendeeJoinedOnce', () => {
    const events = attendee.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(AttendeeJoined);
    expect((events[0] as AttendeeJoined).toPrimitives()).toEqual({ eventId: eventId.value, attendeeId: id.value });
    expect(attendee.pullDomainEvents()).toHaveLength(0);
  });

  it('testViewHoldsIdEventNameAndJoinTime', () => {
    expect(attendee.toDTO()).toEqual({
      id: id.value,
      eventId: eventId.value,
      name: 'Ana',
      joinedAt: '2026-10-25T20:00:00.000Z',
    });
  });
});
