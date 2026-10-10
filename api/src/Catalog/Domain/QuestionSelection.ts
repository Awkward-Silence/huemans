import type { Question } from '@Huemans/Types/Question';
import type { TraitValue } from '@Huemans/Types/Trait';

export interface AnswerChoice {
  questionId: string;
  answerId: string;
}

/** The questions found for a list of requested ids, in the requested order. */
export class QuestionSelection {
  private constructor(
    readonly questions: Question[],
    readonly missing: string[],
  ) {}

  static of(requestedIds: string[], found: Question[]): QuestionSelection {
    const byId = new Map(found.map((question) => [question.id, question]));
    return new QuestionSelection(
      requestedIds.flatMap((id) => byId.get(id) ?? []),
      requestedIds.filter((id) => !byId.has(id)),
    );
  }

  /** One trait per choice, repeats kept; a choice whose answer is not part of its question is ignored. */
  traitsOf(choices: AnswerChoice[]): TraitValue[] {
    return choices.flatMap(({ questionId, answerId }) => {
      const answer = this.questions
        .find((question) => question.id === questionId)
        ?.answers.find((candidate) => candidate.id === answerId);
      return answer ? [answer.trait] : [];
    });
  }
}
