import { z } from 'zod';

// Shape only: the content rules (themes, traits, 4 answers, lengths) are the Question aggregate's.
export const QuestionListSchema = z.array(
  z.object({
    id: z.string(),
    theme: z.string(),
    text: z.string(),
    answers: z.array(z.object({ id: z.string(), text: z.string(), trait: z.string() })),
  }),
);
