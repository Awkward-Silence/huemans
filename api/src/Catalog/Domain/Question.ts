import { AnswerCollection } from './ValueObject/AnswerCollection';
import { QuestionId } from './ValueObject/QuestionId';
import { Theme } from './ValueObject/Theme';

/** Read model: a question with its 4 trait-tagged answers. */
export class Question {
  constructor(
    readonly id: QuestionId,
    readonly theme: Theme,
    readonly text: string,
    readonly answers: AnswerCollection,
  ) {}
}
