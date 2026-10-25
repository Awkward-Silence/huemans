import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { Color } from '@Huemans/Shared/Domain/ValueObject/Color';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

export const GROUP_DIRECTORY = Symbol('NightIcebreakerGroupDirectory');

export interface GroupDirectory {
  /** Null while the attendee has no group. */
  colorOf(eventId: EventId, attendeeId: AttendeeId): Promise<Color | null>;
}
