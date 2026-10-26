import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { AttendeeJoined } from './AttendeeJoined';
import { AttendeeView } from './AttendeeView';
import { AttendeeName } from './ValueObject/AttendeeName';

export class Attendee extends AggregateRoot {
  private constructor(
    readonly id: AttendeeId,
    readonly eventId: EventId,
    readonly name: AttendeeName,
    readonly joinedAt: Date,
  ) {
    super();
  }

  static join(id: AttendeeId, eventId: EventId, name: AttendeeName, joinedAt: Date): Attendee {
    const attendee = new Attendee(id, eventId, name, joinedAt);
    attendee.record(new AttendeeJoined(id.value, eventId.value));

    return attendee;
  }

  toDTO(): AttendeeView {
    return {
      id: this.id.value,
      eventId: this.eventId.value,
      name: this.name.value,
      joinedAt: this.joinedAt.toISOString(),
    };
  }
}
