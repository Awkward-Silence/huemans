import { z } from 'zod';

// Shape only: the content rules (one profile per type, 3 chips of its own type, lengths) are PersonalityTypes'.
export const PersonalityTypeProfileListSchema = z.array(
  z.object({ type: z.string(), nickname: z.string(), blurb: z.string(), traits: z.array(z.string()) }),
);
