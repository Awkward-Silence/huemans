import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

export class AttendeeAlreadyAssigned extends Error {
  constructor(eventId: EventId, attendeeId: AttendeeId) {
    super(`Attendee <${attendeeId.value}> is already assigned in event <${eventId.value}>`);
    this.name = new.target.name;
  }
}
