import { Injectable } from '@nestjs/common';
import { DomainEvent } from '../../Domain/DomainEvent';
import { EventDispatcher } from '../../Domain/Port/EventDispatcher';

type Subscriber = (event: DomainEvent) => Promise<void>;

@Injectable()
export class InMemoryEventDispatcher implements EventDispatcher {
  private readonly subscribers = new Map<string, Subscriber[]>();

  subscribe<E extends DomainEvent>(eventName: string, subscriber: (event: E) => Promise<void>): void {
    this.subscribers.set(eventName, [...(this.subscribers.get(eventName) ?? []), subscriber as Subscriber]);
  }

  async dispatchAll(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      for (const subscriber of this.subscribers.get(event.eventName) ?? []) {
        await subscriber(event);
      }
    }
  }
}
