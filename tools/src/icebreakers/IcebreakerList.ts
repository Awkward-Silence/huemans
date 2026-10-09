import * as zod from "zod";
import { ThemeSchema } from "../questions/Themes.ts";
import { TraitSchema } from "../questions/Traits.ts";


/** An open question to start a conversation; it suits people with the given traits. */
const IcebreakerSchema = zod.object({
  id: zod.string().min(1),
  theme: ThemeSchema,
  text: zod.string().min(1),
  traits: zod
    .array(TraitSchema)
    .min(1)
    .max(3)
    .refine((traits) => new Set(traits).size === traits.length, "Traits must be unique"),
});

const IcebreakerListSchema = zod.array(IcebreakerSchema);

type Icebreaker = zod.infer<typeof IcebreakerSchema>;
type IcebreakerList = zod.infer<typeof IcebreakerListSchema>;


export { IcebreakerSchema, IcebreakerListSchema };
export type { Icebreaker, IcebreakerList };
