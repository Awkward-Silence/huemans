import { v7 } from 'uuid';

export abstract class DomainEvent {
  readonly eventName: string;
  readonly aggregateId: string;
  readonly eventId: string;
  readonly occurredOn: Date;

  protected constructor(params: { eventName: string; aggregateId: string; eventId?: string; occurredOn?: Date }) {
    this.eventName = params.eventName;
    this.aggregateId = params.aggregateId;
    this.eventId = params.eventId ?? v7();
    this.occurredOn = params.occurredOn ?? new Date();
  }

  abstract toPrimitives(): Record<string, unknown>;
}
