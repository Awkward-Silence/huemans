import { Trait } from './Trait';
import { TraitWeight } from './TraitWeight';

export interface WeightedTraitPrimitives {
  trait: string;
  weight: number;
}

/** A trait an attendee's answers point to, and how strongly. */
export class WeightedTrait {
  constructor(
    readonly trait: Trait,
    readonly weight: TraitWeight,
  ) {}

  static fromPrimitives({ trait, weight }: WeightedTraitPrimitives): WeightedTrait {
    return new WeightedTrait(new Trait(trait), new TraitWeight(weight));
  }

  toPrimitives(): WeightedTraitPrimitives {
    return { trait: this.trait.value, weight: this.weight.value };
  }
}
