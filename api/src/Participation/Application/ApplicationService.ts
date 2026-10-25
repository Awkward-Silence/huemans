import { Inject, Injectable } from '@nestjs/common';
import { AssignedGroup } from '@Huemans/Participation/Domain/AssignedGroup';
import { Attendee } from '@Huemans/Participation/Domain/Attendee';
import { AttendeeNotFound } from '@Huemans/Participation/Domain/AttendeeNotFound';
import { ATTENDEE_REPOSITORY, AttendeeRepository } from '@Huemans/Participation/Domain/Port/AttendeeRepository';
import { EVENT_DIRECTORY, EventDirectory } from '@Huemans/Participation/Domain/Port/EventDirectory';
import { GROUP_DIRECTORY, GroupDirectory } from '@Huemans/Participation/Domain/Port/GroupDirectory';
import { QUESTION_CATALOG, QuestionCatalog } from '@Huemans/Participation/Domain/Port/QuestionCatalog';
import { SENTENCE_TRAIT_WEIGHER, SentenceTraitWeigher } from '@Huemans/Participation/Domain/Port/SentenceTraitWeigher';
import { Questionnaire } from '@Huemans/Participation/Domain/Questionnaire';
import { Quiz } from '@Huemans/Participation/Domain/Quiz';
import { QuizView } from '@Huemans/Participation/Domain/QuizView';
import { UnknownEvent } from '@Huemans/Participation/Domain/UnknownEvent';
import { AnswerChoice } from '@Huemans/Participation/Domain/ValueObject/AnswerChoice';
import { AttendeeName } from '@Huemans/Participation/Domain/ValueObject/AttendeeName';
import { QuizSettings } from '@Huemans/Participation/Domain/ValueObject/QuizSettings';
import { SentenceAnswer } from '@Huemans/Participation/Domain/ValueObject/SentenceAnswer';
import { SentenceTraits } from '@Huemans/Participation/Domain/ValueObject/SentenceTraits';
import { EVENT_DISPATCHER, EventDispatcher } from '@Huemans/Shared/Domain/Port/EventDispatcher';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

@Injectable()
export class ApplicationService {
  constructor(
    @Inject(EVENT_DIRECTORY) private readonly events: EventDirectory,
    @Inject(QUESTION_CATALOG) private readonly catalog: QuestionCatalog,
    @Inject(SENTENCE_TRAIT_WEIGHER) private readonly weigher: SentenceTraitWeigher,
    @Inject(GROUP_DIRECTORY) private readonly groups: GroupDirectory,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendees: AttendeeRepository,
    @Inject(EVENT_DISPATCHER) private readonly dispatcher: EventDispatcher,
  ) {}

  /** Every call creates a new attendee, also after the reveal. */
  async join(eventId: string, name: string): Promise<{ attendeeId: string }> {
    const event = new EventId(eventId);
    const attendeeName = new AttendeeName(name);
    await this.ensureExists(event);

    const attendee = Attendee.join(AttendeeId.random(), event, attendeeName, new Date());
    await this.attendees.save(attendee);
    await this.dispatcher.dispatchAll(attendee.pullDomainEvents());

    return { attendeeId: attendee.id.value };
  }

  async quizOf(eventId: string): Promise<QuizView> {
    const event = new EventId(eventId);
    await this.ensureExists(event);

    return Quiz.for(event, await this.catalog.allQuestions(), QuizSettings.standard()).toDTO();
  }

  /** Scores the answers and returns the attendee's group; a repeated submission returns the first group. */
  async submit(
    eventId: string,
    attendeeId: string,
    answers: { questionId: string; answerId: string }[],
    sentence: { question: string; answer: string } | null,
  ): Promise<AssignedGroup> {
    const event = new EventId(eventId);
    const attendee = new AttendeeId(attendeeId);
    const choices = answers.map(({ questionId, answerId }) => new AnswerChoice(questionId, answerId));
    const sentenceAnswer = sentence === null ? null : new SentenceAnswer(sentence.question, sentence.answer);
    await this.ensureExists(event);
    if ((await this.attendees.searchIn(event, attendee)) === null) {
      throw new AttendeeNotFound(event, attendee);
    }
    const alreadyGrouped = await this.groups.groupOf(event, attendee);
    if (alreadyGrouped !== null) {
      return alreadyGrouped;
    }

    const [answerTraits, sentenceTraits] = await Promise.all([
      this.catalog.traitsOf(choices),
      sentenceAnswer === null ? SentenceTraits.none() : this.weigher.weigh(sentenceAnswer),
    ]);
    const questionnaire = Questionnaire.complete(event, attendee, answerTraits, sentenceTraits);
    // Subscribers run in-process and in order, so Color Distribution has grouped the attendee when this returns.
    await this.dispatcher.dispatchAll(questionnaire.pullDomainEvents());

    const group = await this.groups.groupOf(event, attendee);
    if (group === null) {
      throw new Error(`Attendee <${attendee.value}> was not grouped after completing the questionnaire`);
    }
    return group;
  }

  private async ensureExists(event: EventId): Promise<void> {
    if (!(await this.events.exists(event))) {
      throw new UnknownEvent(event);
    }
  }
}
