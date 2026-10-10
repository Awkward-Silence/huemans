import { z } from 'zod';
import { THEMES } from '../../Domain/ValueObject/Theme';
import { TRAITS } from '../../../Shared/Domain/ValueObject/Trait';

/** One selectable answer; picking it hints at the given character trait. */
export const AnswerSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  trait: z.enum(TRAITS),
});

/** A get-to-know-you question with exactly four answers to choose from. */
export const QuestionSchema = z.object({
  id: z.string().min(1),
  theme: z.enum(THEMES),
  text: z.string().min(1),
  answers: z
    .array(AnswerSchema)
    .length(4)
    .refine(
      (answers) => new Set(answers.map((answer) => answer.id)).size === answers.length,
      'Answer ids must be unique',
    ),
});

export const QuestionListSchema = z.array(QuestionSchema);

export type Answer = z.infer<typeof AnswerSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuestionList = z.infer<typeof QuestionListSchema>;
