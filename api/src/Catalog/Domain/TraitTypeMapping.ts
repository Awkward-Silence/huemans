import { PersonalityType, PersonalityTypeValue } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait, TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';

export type TraitTypeMappingDTO = Record<TraitValue, PersonalityTypeValue>;

/**
 * Read model: each trait with its one personality type. "Every trait exactly once" is checked by the seed and by
 * Color distribution's own TraitTypeMapping, which owns the rule that uses it, so it is not repeated here.
 */
export class TraitTypeMapping {
  constructor(readonly pairs: readonly (readonly [Trait, PersonalityType])[]) {}

  toDTO(): TraitTypeMappingDTO {
    return Object.fromEntries(this.pairs.map(([trait, type]) => [trait.value, type.value])) as TraitTypeMappingDTO;
  }
}
