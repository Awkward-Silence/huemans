import { NotFoundError } from '@Huemans/Shared/Domain/NotFoundError';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

export class AttendeeNotFound extends NotFoundError {
  constructor(eventId: EventId, attendeeId: AttendeeId) {
    super(`Attendee <${attendeeId.value}> did not join event <${eventId.value}>`);
  }
}
