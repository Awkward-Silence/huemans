import { DomainEvent } from '../DomainEvent';

// Published by the Event context; defined here because Color Distribution consumes it before that context exists.
export class EventCreated extends DomainEvent {
  static readonly EVENT_NAME = 'event.created';

  constructor(eventId: string) {
    super({ eventName: EventCreated.EVENT_NAME, aggregateId: eventId });
  }

  toPrimitives(): { eventId: string } {
    return { eventId: this.aggregateId };
  }
}
