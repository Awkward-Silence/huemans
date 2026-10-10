import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait, TRAITS, TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { PersonalityType } from './PersonalityType';

export class TraitTypeMapping {
  private readonly types = new Map<TraitValue, PersonalityType>();

  constructor(pairs: readonly (readonly [Trait, PersonalityType])[]) {
    for (const [trait, type] of pairs) {
      if (this.types.has(trait.value)) {
        throw new InvalidArgumentError(`<TraitTypeMapping> maps the trait <${trait.value}> more than once`);
      }
      this.types.set(trait.value, type);
    }
    const missing = TRAITS.filter((trait) => !this.types.has(trait));
    if (missing.length > 0) {
      throw new InvalidArgumentError(`<TraitTypeMapping> does not map the traits <${missing.join(', ')}>`);
    }
  }

  typeOf(trait: Trait): PersonalityType {
    return this.types.get(trait.value)!;
  }
}
