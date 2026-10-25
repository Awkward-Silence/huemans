import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';

export class EventRevealed extends DomainEvent {
  static readonly EVENT_NAME = 'event.revealed';

  constructor(eventId: string) {
    super({ eventName: EventRevealed.EVENT_NAME, aggregateId: eventId });
  }

  toPrimitives(): { eventId: string } {
    return { eventId: this.aggregateId };
  }
}
