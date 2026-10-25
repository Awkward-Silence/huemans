import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

export interface QuizQuestionPrimitives {
  id: string;
  theme: string;
  text: string;
  answers: { id: string; text: string }[];
}

/** A catalog question as the quiz serves it: answers carry no trait, so the quiz can't give the grouping away. */
export class QuizQuestion {
  private constructor(private readonly primitives: QuizQuestionPrimitives) {}

  static fromPrimitives(primitives: QuizQuestionPrimitives): QuizQuestion {
    const texts = [
      primitives.id,
      primitives.theme,
      primitives.text,
      ...primitives.answers.flatMap((a) => [a.id, a.text]),
    ];
    if (texts.some((text) => text.trim().length === 0)) {
      throw new InvalidArgumentError(`<QuizQuestion> <${primitives.id}> has an empty field`);
    }
    if (primitives.answers.length !== 4) {
      throw new InvalidArgumentError(`<QuizQuestion> <${primitives.id}> must have 4 answers`);
    }
    return new QuizQuestion({
      id: primitives.id,
      theme: primitives.theme,
      text: primitives.text,
      answers: primitives.answers.map(({ id, text }) => ({ id, text })),
    });
  }

  get id(): string {
    return this.primitives.id;
  }

  get theme(): string {
    return this.primitives.theme;
  }

  toPrimitives(): QuizQuestionPrimitives {
    return { ...this.primitives, answers: this.primitives.answers.map((answer) => ({ ...answer })) };
  }
}
