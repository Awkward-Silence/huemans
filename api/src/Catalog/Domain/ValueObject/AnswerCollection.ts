import { Collection } from '@Huemans/Shared/Domain/Collection';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Answer } from '../Answer';

/** The 4 answers of one question, in authored order, with ids unique within the question. */
export class AnswerCollection extends Collection<Answer> {
  constructor(answers: readonly Answer[]) {
    super(answers);
    if (answers.length !== 4) {
      throw new InvalidArgumentError(`<AnswerCollection> needs exactly 4 answers, got ${answers.length}`);
    }
    if (new Set(answers.map((answer) => answer.id.value)).size !== answers.length) {
      throw new InvalidArgumentError('<AnswerCollection> repeats an answer id');
    }
  }

  protected type(): typeof Answer {
    return Answer;
  }
}
