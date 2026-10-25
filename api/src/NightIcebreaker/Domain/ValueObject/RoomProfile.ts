import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { WeightedTrait } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';
import { IcebreakerCandidate } from './IcebreakerCandidate';

/** Scores closer than this are a tie: weights from the AI are floats. */
const TIE_TOLERANCE = 1e-9;

/** The summed weight of each trait over every attendee of an event who completed the questionnaire. */
export class RoomProfile {
  private readonly weights = new Map<string, number>();

  constructor(traits: readonly WeightedTrait[]) {
    for (const { trait, weight } of traits) {
      this.weights.set(trait.value, this.weightOf(trait) + weight.value);
    }
  }

  weightOf(trait: Trait): number {
    return this.weights.get(trait.value) ?? 0;
  }

  /** The candidate whose traits have the highest summed room weight; ties, and an empty room, go to the lowest id. */
  bestMatch(candidates: readonly IcebreakerCandidate[]): IcebreakerCandidate {
    if (candidates.length === 0) {
      throw new InvalidArgumentError('<RoomProfile> needs at least one icebreaker to pick from');
    }
    const byId = [...candidates].sort((a, b) => a.id.value.localeCompare(b.id.value));

    return byId.reduce((best, candidate) =>
      this.scoreOf(candidate) - this.scoreOf(best) > TIE_TOLERANCE ? candidate : best,
    );
  }

  /** The given traits the room has, heaviest first. */
  strongestOf(traits: readonly Trait[]): Trait[] {
    return traits.filter((trait) => this.weightOf(trait) > 0).sort((a, b) => this.weightOf(b) - this.weightOf(a));
  }

  private scoreOf(candidate: IcebreakerCandidate): number {
    return candidate.traits.reduce((sum, trait) => sum + this.weightOf(trait), 0);
  }
}
