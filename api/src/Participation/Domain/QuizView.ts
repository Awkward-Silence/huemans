import { QuizQuestionPrimitives } from './ValueObject/QuizQuestion';
import { SentenceQuestionPrimitives } from './ValueObject/SentenceQuestion';

export interface QuizView {
  questions: QuizQuestionPrimitives[];
  durationSeconds: number;
  sentence: SentenceQuestionPrimitives;
}
