import { AggregateRoot } from '@Huemans/Shared/Domain/AggregateRoot';
import { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { QuestionAuthored } from './Event/QuestionAuthored';
import { AnswerCollection } from './ValueObject/AnswerCollection';
import { QuestionId } from './ValueObject/QuestionId';
import { QuestionText } from './ValueObject/QuestionText';
import { Theme, ThemeValue } from './ValueObject/Theme';

export interface QuestionDTO {
  id: string;
  theme: ThemeValue;
  text: string;
  answers: { id: string; text: string; trait: TraitValue }[];
}

/** A question with its 4 trait-tagged answers; authored once, at the seed. */
export class Question extends AggregateRoot {
  private constructor(
    readonly id: QuestionId,
    readonly theme: Theme,
    readonly text: QuestionText,
    readonly answers: AnswerCollection,
  ) {
    super();
  }

  static author(id: QuestionId, theme: Theme, text: QuestionText, answers: AnswerCollection): Question {
    const question = new Question(id, theme, text, answers);
    question.record(new QuestionAuthored(id.value));
    return question;
  }

  /** A stored question, read back: nothing happened, so nothing is recorded. */
  static rebuild(id: QuestionId, theme: Theme, text: QuestionText, answers: AnswerCollection): Question {
    return new Question(id, theme, text, answers);
  }

  toDTO(): QuestionDTO {
    return {
      id: this.id.value,
      theme: this.theme.value,
      text: this.text.value,
      answers: this.answers
        .all()
        .map(({ id, text, trait }) => ({ id: id.value, text: text.value, trait: trait.value })),
    };
  }
}
