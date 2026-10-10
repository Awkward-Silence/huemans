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

  create(name: string): Promise<EventView> {
    return this.createWith(EventId.random(), new EventName(name));
  }

  /** Creates the event with a known id, or returns it unchanged when it already exists. */
  async ensure(eventId: string, name: string): Promise<EventView> {
    const id = new EventId(eventId);
    const existing = await this.events.search(id);
    if (existing !== null) {
      return existing.toDTO();
    }

    return this.createWith(id, new EventName(name));
  }

  private async createWith(id: EventId, name: EventName): Promise<EventView> {
    const event = Event.create(id, name);
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
