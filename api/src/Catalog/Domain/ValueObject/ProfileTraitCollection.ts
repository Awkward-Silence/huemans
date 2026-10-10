import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { TraitSet } from './TraitSet';

/** The 3 distinct trait chips shown at the reveal; the seed checks they belong to the profile's type. */
export class ProfileTraitCollection extends TraitSet {
  constructor(traits: readonly Trait[]) {
    super(traits, 3, 3);
  }
}
