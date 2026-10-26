import { NotFoundError } from '@Huemans/Shared/Domain/NotFoundError';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

export class UnknownEvent extends NotFoundError {
  constructor(id: EventId) {
    super(`Event <${id.value}> does not exist`);
  }
}
