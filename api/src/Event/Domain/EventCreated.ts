import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';

export class EventCreated extends DomainEvent {
  static readonly EVENT_NAME = 'event.created';

  constructor(eventId: string) {
    super({ eventName: EventCreated.EVENT_NAME, aggregateId: eventId });
  }

  toPrimitives(): { eventId: string } {
    return { eventId: this.aggregateId };
  }
}
