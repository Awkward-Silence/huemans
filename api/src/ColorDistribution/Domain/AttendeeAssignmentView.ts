import { ColorValue } from './ValueObject/Color';
import { PersonalityTypeValue } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';

export interface AttendeeAssignmentView {
  eventId: string;
  attendeeId: string;
  color: ColorValue;
  personalityType: PersonalityTypeValue;
  /** The other attendees in the same group; keeps growing as others join it. */
  mates: number;
}
