import { PersonalityType, PersonalityTypeValue } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { TraitTypeMapping } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitTypeMapping';
import { Trait, TRAITS, TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';

// Every trait not listed maps to dreamer, so tests only spell out the traits they use.
export function mappingWith(types: Partial<Record<TraitValue, PersonalityTypeValue>>): TraitTypeMapping {
  return new TraitTypeMapping(
    TRAITS.map((trait) => [new Trait(trait), new PersonalityType(types[trait] ?? 'dreamer')] as const),
  );
}
