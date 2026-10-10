import { z } from 'zod';
import type { PersonalityTypeProfileContent } from './PersonalityTypeProfileList';
import { PERSONALITY_TYPES } from '../../../Shared/Domain/ValueObject/PersonalityType';
import { TRAITS } from '../../../Shared/Domain/ValueObject/Trait';

/** Each of the 33 traits to its one personality type; a record over the enum, so every trait must be present. */
export const TraitTypeMappingContentSchema = z.record(z.enum(TRAITS), z.enum(PERSONALITY_TYPES));

export type TraitTypeMappingContent = z.infer<typeof TraitTypeMappingContentSchema>;

/** Problems where a profile shows a trait chip that the mapping places in another type; empty when consistent. */
export function checkProfileChips(
  profiles: PersonalityTypeProfileContent[],
  mapping: TraitTypeMappingContent,
): string[] {
  return profiles.flatMap(({ type, traits }) =>
    traits
      .filter((trait) => mapping[trait] !== type)
      .map((trait) => `${type} chip ${trait} is mapped to ${mapping[trait]}`),
  );
}
