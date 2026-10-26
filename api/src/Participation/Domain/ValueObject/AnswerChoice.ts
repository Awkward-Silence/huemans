import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

/** The answer an attendee picked for one multiple-choice question, by catalog ids. */
export class AnswerChoice {
  constructor(
    readonly questionId: string,
    readonly answerId: string,
  ) {
    if (questionId.trim() === '' || answerId.trim() === '') {
      throw new InvalidArgumentError('<AnswerChoice> requires a question id and an answer id');
    }
  }

  key(): string {
    return `${this.questionId}/${this.answerId}`;
  }
}
