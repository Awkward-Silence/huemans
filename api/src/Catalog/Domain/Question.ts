import { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { AnswerCollection } from './ValueObject/AnswerCollection';
import { QuestionId } from './ValueObject/QuestionId';
import { Theme, ThemeValue } from './ValueObject/Theme';

export interface QuestionDTO {
  id: string;
  theme: ThemeValue;
  text: string;
  answers: { id: string; text: string; trait: TraitValue }[];
}

/** Read model: a question with its 4 trait-tagged answers. */
export class Question {
  constructor(
    readonly id: QuestionId,
    readonly theme: Theme,
    readonly text: string,
    readonly answers: AnswerCollection,
  ) {}

  toDTO(): QuestionDTO {
    return {
      id: this.id.value,
      theme: this.theme.value,
      text: this.text,
      answers: this.answers.all().map(({ id, text, trait }) => ({ id: id.value, text, trait: trait.value })),
    };
  }
}
