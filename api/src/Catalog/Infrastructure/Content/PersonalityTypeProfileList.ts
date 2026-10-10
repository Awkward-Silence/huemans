import { z } from 'zod';
import { PERSONALITY_TYPES } from '../../../Shared/Domain/ValueObject/PersonalityType';
import { TRAITS } from '../../../Shared/Domain/ValueObject/Trait';

/** The reveal copy of one personality type: a title, a description and 3 trait chips. */
export const PersonalityTypeProfileSchema = z.object({
  type: z.enum(PERSONALITY_TYPES),
  nickname: z.string().min(1),
  blurb: z.string().min(1),
  traits: z
    .array(z.enum(TRAITS))
    .length(3)
    .refine((traits) => new Set(traits).size === traits.length, 'Traits must be unique'),
});

export const PersonalityTypeProfileListSchema = z.array(PersonalityTypeProfileSchema).superRefine((profiles, ctx) => {
  for (const type of PERSONALITY_TYPES) {
    const count = profiles.filter((profile) => profile.type === type).length;
    if (count !== 1) {
      ctx.addIssue({ code: 'custom', message: `Expected exactly one profile for <${type}>, found ${count}` });
    }
  }
});

export type PersonalityTypeProfileContent = z.infer<typeof PersonalityTypeProfileSchema>;
