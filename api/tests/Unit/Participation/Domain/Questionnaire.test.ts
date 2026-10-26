import { Questionnaire } from '@Huemans/Participation/Domain/Questionnaire';
import { SentenceTraits } from '@Huemans/Participation/Domain/ValueObject/SentenceTraits';
import { QuestionnaireCompleted } from '@Huemans/Participation/Domain/QuestionnaireCompleted';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

describe('Questionnaire', () => {
  let eventId: EventId;
  let attendeeId: AttendeeId;

  beforeEach(() => {
    eventId = EventId.random();
    attendeeId = AttendeeId.random();
  });

  it('testEveryAnswerWeighsOneAndTheSentenceOneMore', () => {
    const sentence = SentenceTraits.fromScores([
      [new Trait('romantic'), 0.5],
      [new Trait('dramatic'), 0.5],
    ]);

    const questionnaire = Questionnaire.complete(
      eventId,
      attendeeId,
      [new Trait('curious'), new Trait('curious')],
      sentence,
    );

    expect(questionnaire.toDTO()).toEqual({
      eventId: eventId.value,
      attendeeId: attendeeId.value,
      traits: [
        { trait: 'curious', weight: 1 },
        { trait: 'curious', weight: 1 },
        { trait: 'romantic', weight: 0.5 },
        { trait: 'dramatic', weight: 0.5 },
      ],
    });
  });

  it('testCompletingRecordsQuestionnaireCompleted', () => {
    const questionnaire = Questionnaire.complete(eventId, attendeeId, [new Trait('sociable')], SentenceTraits.none());

    const events = questionnaire.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(QuestionnaireCompleted);
    expect(events[0].toPrimitives()).toEqual({
      eventId: eventId.value,
      attendeeId: attendeeId.value,
      traits: [{ trait: 'sociable', weight: 1 }],
    });
  });

  it('testCompletesWithNoTraitsAtAll', () => {
    const questionnaire = Questionnaire.complete(eventId, attendeeId, [], SentenceTraits.none());

    expect(questionnaire.toDTO().traits).toEqual([]);
  });
});
