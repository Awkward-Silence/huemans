import { DomainEvent } from './DomainEvent';

export abstract class AggregateRoot {
  // Initialized lazily: the ORM rebuilds aggregates without calling their constructor.
  private domainEvents?: DomainEvent[];

  protected record(event: DomainEvent): void {
    (this.domainEvents ??= []).push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = this.domainEvents ?? [];
    this.domainEvents = [];

    return events;
  }

  abstract toDTO(): object;
}
