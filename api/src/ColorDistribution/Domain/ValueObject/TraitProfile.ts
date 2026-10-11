import { Collection } from '@Huemans/Shared/Domain/Collection';
import { PERSONALITY_TYPES, PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { WeightedTrait } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';
import { TraitTypeMapping } from './TraitTypeMapping';

/** Sums closer than this are a tie: weights from the AI are floats. */
const TIE_TOLERANCE = 1e-9;

export class TraitProfile extends Collection<WeightedTrait> {
  protected type(): typeof WeightedTrait {
    return WeightedTrait;
  }

  /**
   * The types with the highest summed weight: one normally, several when tied, in PERSONALITY_TYPES order.
   * An empty profile ties all four types, so every attendee still gets a group.
   */
  candidateTypes(mapping: TraitTypeMapping): PersonalityType[] {
    const scores = new Map<string, number>(PERSONALITY_TYPES.map((type) => [type, 0]));
    for (const { trait, weight } of this) {
      const type = mapping.typeOf(trait).value;
      scores.set(type, scores.get(type)! + weight.value);
    }
    const best = Math.max(...scores.values());

    return PERSONALITY_TYPES.filter((type) => best - scores.get(type)! < TIE_TOLERANCE).map(
      (type) => new PersonalityType(type),
    );
  }
}
