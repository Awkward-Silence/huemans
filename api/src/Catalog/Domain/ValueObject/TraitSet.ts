import { Collection } from '@Huemans/Shared/Domain/Collection';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

/** Distinct traits within a size range; the concrete collections fix the range. */
export abstract class TraitSet extends Collection<Trait> {
  protected constructor(traits: readonly Trait[], min: number, max: number) {
    super(traits);
    if (traits.length < min || traits.length > max) {
      const expected = min === max ? `${min}` : `${min} to ${max}`;
      throw new InvalidArgumentError(`<${new.target.name}> needs ${expected} traits, got ${traits.length}`);
    }
    if (new Set(traits.map((trait) => trait.value)).size !== traits.length) {
      throw new InvalidArgumentError(`<${new.target.name}> repeats a trait`);
    }
  }

  protected type(): typeof Trait {
    return Trait;
  }
}
