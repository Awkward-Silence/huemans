import { INestApplication } from '@nestjs/common';
import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';
import { InMemoryEventDispatcher } from '@Huemans/Shared/Infrastructure/EventDispatcher/InMemoryEventDispatcher';

export async function publish(app: INestApplication, ...events: DomainEvent[]): Promise<void> {
  await app.get(InMemoryEventDispatcher).dispatchAll(events);
}

export function recordPublished(app: INestApplication, eventName: string): DomainEvent[] {
  const published: DomainEvent[] = [];
  app.get(InMemoryEventDispatcher).subscribe(eventName, (event) => {
    published.push(event);
    return Promise.resolve();
  });
  return published;
}
