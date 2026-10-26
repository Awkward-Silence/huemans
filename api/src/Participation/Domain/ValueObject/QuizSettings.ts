export interface QuizSettingsPrimitives {
  questionCount: number;
  durationSeconds: number;
}

/** Fixed for the MVP: every event asks 5 questions with a 20 s soft timer for the whole quiz. */
export class QuizSettings {
  private constructor(
    readonly questionCount: number,
    readonly durationSeconds: number,
  ) {}

  static standard(): QuizSettings {
    return new QuizSettings(5, 20);
  }

  toPrimitives(): QuizSettingsPrimitives {
    return { questionCount: this.questionCount, durationSeconds: this.durationSeconds };
  }
}
