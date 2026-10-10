import type { AttendeeGrouped as AttendeeGroupedPayload } from '../../../../contracts/colorDistribution';
import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Color } from './ValueObject/Color';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';

export class AttendeeGrouped extends DomainEvent {
  static readonly EVENT_NAME = 'color_distribution.attendee_grouped';

  // The event id travels as aggregateId: DomainEvent.eventId is this message's own id.
  constructor(
    eventId: EventId,
    readonly attendeeId: AttendeeId,
    readonly color: Color,
    readonly personalityType: PersonalityType,
  ) {
    super({ eventName: AttendeeGrouped.EVENT_NAME, aggregateId: eventId.value });
  }

  toPrimitives(): AttendeeGroupedPayload {
    return {
      eventId: this.aggregateId,
      attendeeId: this.attendeeId.value,
      color: this.color.value,
      personalityType: this.personalityType.value,
    };
  }
}
