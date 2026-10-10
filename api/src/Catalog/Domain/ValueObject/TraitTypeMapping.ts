import { Collection } from '@Huemans/Shared/Domain/Collection';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait, TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { TraitType } from './TraitType';

/** Each of the 33 traits placed in exactly one personality type. */
export class TraitTypeMapping extends Collection<TraitType> {
  constructor(traitTypes: readonly TraitType[]) {
    super(traitTypes);
    const traits = traitTypes.map(({ trait }) => trait.value);
    const repeated = traits.filter((trait, index) => traits.indexOf(trait) !== index);
    const missing = TRAITS.filter((trait) => !traits.includes(trait));
    if (repeated.length > 0 || missing.length > 0) {
      throw new InvalidArgumentError(
        `<TraitTypeMapping> needs every trait exactly once (repeated: ${repeated.join(', ') || 'none'}; missing: ${missing.join(', ') || 'none'})`,
      );
    }
  }

  typeOf(trait: Trait): PersonalityType {
    // Every trait is mapped exactly once, so the lookup always finds one.
    return this.all().find((traitType) => traitType.trait.equals(trait))!.type;
  }

  protected type(): typeof TraitType {
    return TraitType;
  }
}
