import { NotFoundError } from '@Huemans/Shared/Domain/NotFoundError';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

export class EventDistributionNotFound extends NotFoundError {
  constructor(eventId: EventId) {
    super(`Event <${eventId.value}> has no distribution`);
  }
}
