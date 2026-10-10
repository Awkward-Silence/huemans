import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Color } from './ValueObject/Color';
import { PersonalityType } from './ValueObject/PersonalityType';

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

  toDTO(): { eventId: string; attendeeId: string; color: string; personalityType: string } {
    return {
      eventId: this.eventId.value,
      attendeeId: this.attendeeId.value,
      color: this.color.value,
      personalityType: this.personalityType.value,
    };
  }
}
