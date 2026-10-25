import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';

export class NightIcebreakerPicked extends DomainEvent {
  static readonly EVENT_NAME = 'night_icebreaker.picked';

  constructor(
    eventId: string,
    readonly icebreakerId: string,
  ) {
    super({ eventName: NightIcebreakerPicked.EVENT_NAME, aggregateId: eventId });
  }

  toPrimitives(): { eventId: string; icebreakerId: string } {
    return { eventId: this.aggregateId, icebreakerId: this.icebreakerId };
  }
}
