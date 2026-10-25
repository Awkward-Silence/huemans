import { QuizQuestionPrimitives } from './ValueObject/QuizQuestion';

export interface QuizView {
  questions: QuizQuestionPrimitives[];
  durationSeconds: number;
}
