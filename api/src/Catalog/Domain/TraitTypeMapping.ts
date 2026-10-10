import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait, TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';

/** Read model: each of the 33 traits with its one personality type. Color distribution owns the rule that uses it. */
export class TraitTypeMapping {
  constructor(readonly pairs: readonly (readonly [Trait, PersonalityType])[]) {
    const seen = pairs.map(([trait]) => trait.value);
    const repeated = seen.filter((trait, index) => seen.indexOf(trait) !== index);
    const missing = TRAITS.filter((trait) => !seen.includes(trait));
    if (repeated.length > 0 || missing.length > 0) {
      throw new InvalidArgumentError(
        `<TraitTypeMapping> needs every trait exactly once (repeated: ${repeated.join(', ') || 'none'}; missing: ${missing.join(', ') || 'none'})`,
      );
    }
  }
}
