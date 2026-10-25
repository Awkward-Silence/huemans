import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Attendee } from '../Attendee';
import { AttendeeCount } from '../ValueObject/AttendeeCount';

export const ATTENDEE_REPOSITORY = Symbol('AttendeeRepository');

export interface AttendeeRepository {
  save(attendee: Attendee): Promise<void>;
  /** Null when the attendee never joined, or joined another event. */
  searchIn(eventId: EventId, attendeeId: AttendeeId): Promise<Attendee | null>;
  countIn(eventId: EventId): Promise<AttendeeCount>;
}
