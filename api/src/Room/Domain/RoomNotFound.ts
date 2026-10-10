import { NotFoundError } from '@Huemans/Shared/Domain/NotFoundError';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

export class RoomNotFound extends NotFoundError {
  constructor(eventId: EventId) {
    super(`Event <${eventId.value}> does not exist, so it has no room`);
  }
}
