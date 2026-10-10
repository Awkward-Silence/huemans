import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

export const EVENT_DIRECTORY = Symbol('EventDirectory');

export interface EventDirectory {
  exists(eventId: EventId): Promise<boolean>;
}
