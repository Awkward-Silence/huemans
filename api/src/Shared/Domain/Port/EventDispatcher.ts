import { DomainEvent } from '../DomainEvent';

export const EVENT_DISPATCHER = Symbol('EventDispatcher');

export interface EventDispatcher {
  dispatchAll(events: readonly DomainEvent[]): Promise<void>;
}
