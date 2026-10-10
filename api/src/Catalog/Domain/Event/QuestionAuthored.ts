import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';

export class QuestionAuthored extends DomainEvent {
  static readonly EVENT_NAME = 'catalog.question_authored';

  constructor(questionId: string) {
    super({ eventName: QuestionAuthored.EVENT_NAME, aggregateId: questionId });
  }

  toPrimitives(): { questionId: string } {
    return { questionId: this.aggregateId };
  }
}
