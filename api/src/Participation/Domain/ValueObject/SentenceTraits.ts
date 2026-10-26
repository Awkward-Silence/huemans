import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { TraitWeight } from '@Huemans/Shared/Domain/ValueObject/TraitWeight';
import { WeightedTrait } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';

/** Scores below this share of the total are noise and are dropped before rescaling. */
const NOISE_SHARE = 0.05;

/**
 * The traits the sentence answer points to, worth one whole answer in total, like a multiple-choice answer.
 * Empty when the sentence was skipped or could not be weighed.
 */
export class SentenceTraits {
  private constructor(private readonly weighted: readonly WeightedTrait[]) {}

  static none(): SentenceTraits {
    return new SentenceTraits([]);
  }

  /** Rescales any non-negative scores (e.g. the AI's probabilities) so that together they weigh one answer. */
  static fromScores(scores: readonly (readonly [Trait, number])[]): SentenceTraits {
    if (scores.some(([, score]) => !Number.isFinite(score) || score < 0)) {
      throw new InvalidArgumentError('<SentenceTraits> scores must be finite and not negative');
    }
    const total = scores.reduce((sum, [, score]) => sum + score, 0);
    const kept = scores.filter(([, score]) => total > 0 && score / total >= NOISE_SHARE);
    const keptTotal = kept.reduce((sum, [, score]) => sum + score, 0);

    return new SentenceTraits(
      kept.map(
        ([trait, score]) => new WeightedTrait(trait, new TraitWeight((score / keptTotal) * TraitWeight.WHOLE_ANSWER)),
      ),
    );
  }

  all(): readonly WeightedTrait[] {
    return [...this.weighted];
  }
}
