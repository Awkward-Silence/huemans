import { Logger } from '@nestjs/common';
import { z } from 'zod';
import { SentenceTraitWeigher } from '@Huemans/Participation/Domain/Port/SentenceTraitWeigher';
import { SentenceAnswer } from '@Huemans/Participation/Domain/ValueObject/SentenceAnswer';
import { SentenceTraits } from '@Huemans/Participation/Domain/ValueObject/SentenceTraits';
import { Trait, TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';

export interface JevSettings {
  apiKey: string | undefined;
  model: string;
  url: string;
  timeoutMs: number;
}

const CONTEXT =
  'A guest at a party built this answer to an icebreaker question, one suggested word at a time. It is often silly on purpose.';

// Jev (TypeSafe's System One model) answers one Choice over the 33 traits; its probabilities become the weights.
const JevResponse = z.object({
  answers: z.object({
    trait: z.object({ probabilities: z.record(z.string(), z.number()) }),
  }),
});

/** Weighs the sentence with Jev. Any failure (no key, timeout, error, odd response) means no sentence traits. */
export class JevSentenceTraitWeigher implements SentenceTraitWeigher {
  private readonly logger = new Logger(JevSentenceTraitWeigher.name);

  constructor(private readonly settings: JevSettings) {}

  async weigh(sentence: SentenceAnswer): Promise<SentenceTraits> {
    if (this.settings.apiKey === undefined) {
      return SentenceTraits.none();
    }
    try {
      return SentenceTraits.fromScores(await this.probabilities(sentence));
    } catch (error) {
      this.logger.warn(`Jev could not weigh the sentence, so it adds no traits: ${String(error)}`);
      return SentenceTraits.none();
    }
  }

  private async probabilities(sentence: SentenceAnswer): Promise<[Trait, number][]> {
    const response = await fetch(this.settings.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.settings.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.settings.model,
        state: { context: CONTEXT, question: sentence.question, answer: sentence.answer },
        questions: {
          trait: {
            type: 'choice',
            instructions: 'Which character trait does `answer` reveal most about the person who wrote it?',
            criteria: Object.fromEntries(TRAITS.map((trait) => [trait, null])),
          },
        },
      }),
      signal: AbortSignal.timeout(this.settings.timeoutMs),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const { probabilities } = JevResponse.parse(await response.json()).answers.trait;

    return TRAITS.filter((trait) => trait in probabilities).map((trait) => [new Trait(trait), probabilities[trait]]);
  }
}
