import { WeightedTraitPrimitives } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';

/** One whole answer per trait, as Participation weighs a multiple-choice answer. */
export function wholeAnswers(...traits: string[]): WeightedTraitPrimitives[] {
  return traits.map((trait) => ({ trait, weight: 1 }));
}
