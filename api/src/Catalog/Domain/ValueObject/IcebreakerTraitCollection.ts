import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { TraitSet } from './TraitSet';

/** The 1 to 3 distinct traits an icebreaker suits. */
export class IcebreakerTraitCollection extends TraitSet {
  constructor(traits: readonly Trait[]) {
    super(traits, 1, 3);
  }
}
