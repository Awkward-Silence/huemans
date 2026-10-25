import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';

// The attendee is the aggregate; the event id travels as forEventId because DomainEvent.eventId is this message's id.
export class AttendeeJoined extends DomainEvent {
  static readonly EVENT_NAME = 'participation.attendee_joined';

  constructor(
    attendeeId: string,
    readonly forEventId: string,
  ) {
    super({ eventName: AttendeeJoined.EVENT_NAME, aggregateId: attendeeId });
  }

  toPrimitives(): { eventId: string; attendeeId: string } {
    return { eventId: this.forEventId, attendeeId: this.aggregateId };
  }
}
