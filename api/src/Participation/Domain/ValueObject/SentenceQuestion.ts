export interface SentenceQuestionPrimitives {
  id: string;
  starter: string;
  picks: number;
}

/**
 * The "I ..." sentence that closes every quiz: the attendee adds `picks` words after the starter, from Agents'
 * sentence tree. Fixed for the MVP, and it carries no trait of its own.
 */
export class SentenceQuestion {
  private constructor(
    readonly id: string,
    readonly starter: string,
    readonly picks: number,
  ) {}

  static standard(): SentenceQuestion {
    return new SentenceQuestion('sentence-i', 'I', 5);
  }

  toPrimitives(): SentenceQuestionPrimitives {
    return { id: this.id, starter: this.starter, picks: this.picks };
  }
}
