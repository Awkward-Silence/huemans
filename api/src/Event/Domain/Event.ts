import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { EventCreated } from './EventCreated';
import { EventRevealed } from './EventRevealed';
import { EventView } from './EventView';
import { EventName } from './ValueObject/EventName';
import { EventStatus } from './ValueObject/EventStatus';

export class Event extends AggregateRoot {
  private constructor(
    readonly id: EventId,
    readonly name: EventName,
    private status: EventStatus,
  ) {
    super();
  }

  static create(id: EventId, name: EventName): Event {
    const event = new Event(id, name, EventStatus.open());
    event.record(new EventCreated(id.value));

    return event;
  }

  /** A second reveal changes nothing and records nothing, so a double tap is harmless. */
  reveal(): void {
    if (this.status.isRevealed()) {
      return;
    }
    this.status = EventStatus.revealed();
    this.record(new EventRevealed(this.id.value));
  }

  toDTO(): EventView {
    return { id: this.id.value, name: this.name.value, status: this.status.value };
  }
}
