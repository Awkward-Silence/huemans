import { Inject, Injectable } from '@nestjs/common';
import { Event } from '@Huemans/Event/Domain/Event';
import { EventNotFound } from '@Huemans/Event/Domain/EventNotFound';
import { EventView } from '@Huemans/Event/Domain/EventView';
import { EVENT_REPOSITORY, EventRepository } from '@Huemans/Event/Domain/Port/EventRepository';
import { EventName } from '@Huemans/Event/Domain/ValueObject/EventName';
import { EVENT_DISPATCHER, EventDispatcher } from '@Huemans/Shared/Domain/Port/EventDispatcher';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

@Injectable()
export class ApplicationService {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly events: EventRepository,
    @Inject(EVENT_DISPATCHER) private readonly dispatcher: EventDispatcher,
  ) {}

  async create(name: string): Promise<EventView> {
    const event = Event.create(EventId.random(), new EventName(name));
    await this.events.save(event);
    await this.dispatcher.dispatchAll(event.pullDomainEvents());

    return event.toDTO();
  }

  async eventOf(eventId: string): Promise<EventView> {
    const id = new EventId(eventId);
    const event = await this.events.search(id);
    if (event === null) {
      throw new EventNotFound(id);
    }

    return event.toDTO();
  }
}
