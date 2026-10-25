import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { QuestionnaireCompleted } from './QuestionnaireCompleted';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { TraitWeight } from '@Huemans/Shared/Domain/ValueObject/TraitWeight';
import { WeightedTrait } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';
import { QuestionnaireView } from './QuestionnaireView';
import { SentenceTraits } from './ValueObject/SentenceTraits';

/** An attendee's submitted quiz. Not stored: Color Distribution's final assignment is what makes it count once. */
export class Questionnaire extends AggregateRoot {
  private constructor(
    readonly attendeeId: AttendeeId,
    readonly eventId: EventId,
    private readonly traits: readonly WeightedTrait[],
  ) {
    super();
  }

  /** Every multiple-choice answer weighs one whole answer; the sentence adds one more, spread over its traits. */
  static complete(
    eventId: EventId,
    attendeeId: AttendeeId,
    answerTraits: readonly Trait[],
    sentence: SentenceTraits,
  ): Questionnaire {
    const traits = [
      ...answerTraits.map((trait) => new WeightedTrait(trait, TraitWeight.wholeAnswer())),
      ...sentence.all(),
    ];
    const questionnaire = new Questionnaire(attendeeId, eventId, traits);
    questionnaire.record(
      new QuestionnaireCompleted(
        attendeeId.value,
        eventId.value,
        traits.map((trait) => trait.toPrimitives()),
      ),
    );
    return questionnaire;
  }

  toDTO(): QuestionnaireView {
    return {
      eventId: this.eventId.value,
      attendeeId: this.attendeeId.value,
      traits: this.traits.map((trait) => trait.toPrimitives()),
    };
  }
}
