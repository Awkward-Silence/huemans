import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

const MAX_LENGTH = 300;

/** The free-text question (the "I ..." sentence builder) and what the attendee answered, both trimmed. */
export class SentenceAnswer {
  readonly question: string;
  readonly answer: string;

  constructor(question: string, answer: string) {
    this.question = question.trim();
    this.answer = answer.trim();
    for (const [name, text] of [
      ['question', this.question],
      ['answer', this.answer],
    ] as const) {
      if (text === '' || text.length > MAX_LENGTH) {
        throw new InvalidArgumentError(`<SentenceAnswer> needs a ${name} of 1 to ${MAX_LENGTH} characters`);
      }
    }
  }
}
