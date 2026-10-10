import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Color, ColorValue } from '@Huemans/Shared/Domain/ValueObject/Color';
import { PersonalityType, PersonalityTypeValue } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';

export interface AssignmentDTO {
  eventId: string;
  attendeeId: string;
  color: ColorValue;
  personalityType: PersonalityTypeValue;
}

export class Assignment {
  constructor(
    readonly eventId: EventId,
    readonly attendeeId: AttendeeId,
    readonly color: Color,
    readonly personalityType: PersonalityType,
    readonly assignedAt: Date,
  ) {}

  isFor(attendeeId: AttendeeId): boolean {
    return this.attendeeId.equals(attendeeId);
  }

  isIn(color: Color): boolean {
    return this.color.equals(color);
  }

  toDTO(): AssignmentDTO {
    return {
      eventId: this.eventId.value,
      attendeeId: this.attendeeId.value,
      color: this.color.value,
      personalityType: this.personalityType.value,
    };
  }
}
