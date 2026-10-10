import { z } from 'zod';

// Shape only: the content rules (themes, 1 to 3 distinct traits, length) are the Icebreaker aggregate's.
export const IcebreakerListSchema = z.array(
  z.object({ id: z.string(), theme: z.string(), text: z.string(), traits: z.array(z.string()) }),
);
