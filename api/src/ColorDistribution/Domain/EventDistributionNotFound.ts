import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

export class EventDistributionNotFound extends Error {
  constructor(eventId: EventId) {
    super(`Event <${eventId.value}> has no distribution`);
    this.name = new.target.name;
  }
}
