import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Event } from '../Event';

export const EVENT_REPOSITORY = Symbol('EventRepository');

export interface EventRepository {
  save(event: Event): Promise<void>;
  search(id: EventId): Promise<Event | null>;
  /** Locks the event until the surrounding transaction ends, so concurrent reveals run one after the other. */
  searchForUpdate(id: EventId): Promise<Event | null>;
}
