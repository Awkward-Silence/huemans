import { Collection } from '@Huemans/Shared/Domain/Collection';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { PERSONALITY_TYPES, PersonalityType } from './PersonalityType';
import { TraitTypeMapping } from './TraitTypeMapping';

export class TraitProfile extends Collection<Trait> {
  constructor(traits: readonly Trait[]) {
    super(traits);
    if (this.count() === 0) {
      throw new InvalidArgumentError('<TraitProfile> requires at least one trait');
    }
  }

  protected type(): typeof Trait {
    return Trait;
  }

  /** The types most of the traits map to: one normally, several when tied, in PERSONALITY_TYPES order. */
  candidateTypes(mapping: TraitTypeMapping): PersonalityType[] {
    const votes = new Map<string, number>();
    for (const trait of this) {
      const type = mapping.typeOf(trait).value;
      votes.set(type, (votes.get(type) ?? 0) + 1);
    }
    const most = Math.max(...votes.values());

    return PERSONALITY_TYPES.filter((type) => votes.get(type) === most).map((type) => new PersonalityType(type));
  }
}
