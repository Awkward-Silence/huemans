import { DomainEvent } from '../DomainEvent';
import { WeightedTraitPrimitives } from '../ValueObject/WeightedTrait';

// Published by Participation with the attendee's weighted trait profile (one entry per piece of evidence, repeats kept).
// The attendee is the aggregate; the event id travels as forEventId because DomainEvent.eventId is this message's id.
export class QuestionnaireCompleted extends DomainEvent {
  static readonly EVENT_NAME = 'participation.questionnaire_completed';

  constructor(
    attendeeId: string,
    readonly forEventId: string,
    readonly traits: WeightedTraitPrimitives[],
  ) {
    super({ eventName: QuestionnaireCompleted.EVENT_NAME, aggregateId: attendeeId });
  }

  toPrimitives(): { eventId: string; attendeeId: string; traits: WeightedTraitPrimitives[] } {
    return { eventId: this.forEventId, attendeeId: this.aggregateId, traits: this.traits };
  }
}
