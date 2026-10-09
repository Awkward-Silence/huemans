import * as zod from "zod";
import { TraitSchema } from "./Traits.ts";


/** One selectable answer; picking it hints at the given character trait. */
const AnswerSchema = zod.object({
  id: zod.string().min(1),
  text: zod.string().min(1),
  trait: TraitSchema,
});


/** A get-to-know-you question with exactly four answers to choose from. */
const QuestionSchema = zod.object({
  id: zod.string().min(1),
  text: zod.string().min(1),
  answers: zod.array(AnswerSchema).length(4),
});

const QuestionListSchema = zod.array(QuestionSchema)

type Answer = zod.infer<typeof AnswerSchema>;
type Question = zod.infer<typeof QuestionSchema>;
type QuestionList = zod.infer<typeof QuestionListSchema>;


export { AnswerSchema, QuestionSchema, QuestionListSchema };
export type { Answer, Question, QuestionList };
