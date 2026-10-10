import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

export const EVENT_LOOKUP = Symbol('EventLookup');

export interface EventLookup {
  exists(eventId: EventId): Promise<boolean>;
}
