import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { AnswerChoice } from '../ValueObject/AnswerChoice';
import { QuizQuestion } from '../ValueObject/QuizQuestion';

export const QUESTION_CATALOG = Symbol('QuestionCatalog');

export interface QuestionCatalog {
  /** The trait of each known answer, in order; unknown questions or answers are left out. */
  traitsOf(choices: readonly AnswerChoice[]): Promise<Trait[]>;
  allQuestions(): Promise<QuizQuestion[]>;
}
