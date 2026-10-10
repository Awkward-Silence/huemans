import type { Question } from '@Huemans/Types/Question';

export const QUESTION_REPOSITORY = Symbol('QuestionRepository');

export interface QuestionRepository {
  /** Every question ordered by id, answers in file order. */
  all(): Promise<Question[]>;
  /** The questions that exist among the given ids, in any order. */
  byIds(ids: string[]): Promise<Question[]>;
  /** Inserts or updates by id; never deletes. */
  upsert(questions: Question[]): Promise<void>;
}
