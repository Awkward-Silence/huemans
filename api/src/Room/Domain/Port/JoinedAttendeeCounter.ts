import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { AttendeeCount } from '../ValueObject/AttendeeCount';

export const JOINED_ATTENDEE_COUNTER = Symbol('JoinedAttendeeCounter');

export interface JoinedAttendeeCounter {
  joinedIn(eventId: EventId): Promise<AttendeeCount>;
}
