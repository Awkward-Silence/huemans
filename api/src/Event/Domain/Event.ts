import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { EventCreated } from './EventCreated';
import { EventView } from './EventView';
import { EventName } from './ValueObject/EventName';
import { EventStatus } from './ValueObject/EventStatus';

export class Event extends AggregateRoot {
  private constructor(
    readonly id: EventId,
    readonly name: EventName,
    readonly status: EventStatus,
  ) {
    super();
  }

  static create(id: EventId, name: EventName): Event {
    const event = new Event(id, name, EventStatus.open());
    event.record(new EventCreated(id.value));

    return event;
  }

  toDTO(): EventView {
    return { id: this.id.value, name: this.name.value, status: this.status.value };
  }
}
