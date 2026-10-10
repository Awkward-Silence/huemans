import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { AssignedGroup } from '../AssignedGroup';

export const GROUP_DIRECTORY = Symbol('GroupDirectory');

export interface GroupDirectory {
  /** Null while the attendee has no group. */
  groupOf(eventId: EventId, attendeeId: AttendeeId): Promise<AssignedGroup | null>;
}
