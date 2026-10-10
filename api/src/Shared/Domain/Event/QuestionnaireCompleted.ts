import { DomainEvent } from '../DomainEvent';

// Published by Participation with the attendee's trait profile (one entry per answer, repeats kept).
// The attendee is the aggregate; the event id travels as forEventId because DomainEvent.eventId is this message's id.
export class QuestionnaireCompleted extends DomainEvent {
  static readonly EVENT_NAME = 'participation.questionnaire_completed';

  constructor(
    attendeeId: string,
    readonly forEventId: string,
    readonly traits: string[],
  ) {
    super({ eventName: QuestionnaireCompleted.EVENT_NAME, aggregateId: attendeeId });
  }

  toPrimitives(): { eventId: string; attendeeId: string; traits: string[] } {
    return { eventId: this.forEventId, attendeeId: this.aggregateId, traits: this.traits };
  }
}
