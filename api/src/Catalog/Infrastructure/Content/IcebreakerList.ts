import { z } from 'zod';
import { THEMES } from '../../Domain/ValueObject/Theme';
import { TRAITS } from '../../../Shared/Domain/ValueObject/Trait';

/** An open question to start a conversation; it suits people with the given traits. */
export const IcebreakerSchema = z.object({
  id: z.string().min(1),
  theme: z.enum(THEMES),
  text: z.string().min(1),
  traits: z
    .array(z.enum(TRAITS))
    .min(1)
    .max(3)
    .refine((traits) => new Set(traits).size === traits.length, 'Traits must be unique'),
});

export const IcebreakerListSchema = z.array(IcebreakerSchema);

export type Icebreaker = z.infer<typeof IcebreakerSchema>;
export type IcebreakerList = z.infer<typeof IcebreakerListSchema>;
