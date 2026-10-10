import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';

export class IcebreakerAuthored extends DomainEvent {
  static readonly EVENT_NAME = 'catalog.icebreaker_authored';

  constructor(icebreakerId: string) {
    super({ eventName: IcebreakerAuthored.EVENT_NAME, aggregateId: icebreakerId });
  }

  toPrimitives(): { icebreakerId: string } {
    return { icebreakerId: this.aggregateId };
  }
}
