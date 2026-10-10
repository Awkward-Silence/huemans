import * as zod from "zod";
import { TRAITS } from "../../../api/src/Shared/Domain/ValueObject/Trait.ts";


/** How many options the attendee chooses from at every step. */
const BRANCHING = 3;


/** One selectable word or short group of words; picking it hints at the given trait and opens the next options. */
type SentenceOption = {
  id: string;
  text: string;
  trait: (typeof TRAITS)[number];
  next: SentenceOption[];
};

const SentenceOptionSchema: zod.ZodType<SentenceOption> = zod.lazy(() =>
  zod.object({
    id: zod.string().min(1),
    text: zod.string().min(1).regex(/^\S(.*\S)?$/, "No leading or trailing spaces"),
    trait: zod.enum(TRAITS),
    next: zod.array(SentenceOptionSchema),
  }),
);


/**
 * A sentence built from a fixed starter ("I") and `picks` selections. Every step offers exactly 3 options,
 * so the tree holds 3^picks sentences, one per path from the root to a leaf.
 */
const SentenceTreeSchema = zod
  .object({
    id: zod.string().min(1),
    starter: zod.string().min(1),
    picks: zod.number().int().positive(),
    options: zod.array(SentenceOptionSchema),
  })
  .superRefine((tree, ctx) => {
    const ids = new Set<string>();
    const check = (options: SentenceOption[], depth: number, path: (string | number)[]) => {
      const expected = depth <= tree.picks ? BRANCHING : 0;
      if (options.length !== expected) {
        ctx.addIssue({ code: "custom", path, message: `Expected ${expected} options at step ${depth}, got ${options.length}` });
      }
      const texts = options.map((option) => option.text.toLowerCase());
      if (new Set(texts).size !== texts.length) {
        ctx.addIssue({ code: "custom", path, message: `Sibling options repeat a text: ${texts.join(", ")}` });
      }
      options.forEach((option, index) => {
        if (ids.has(option.id)) {
          ctx.addIssue({ code: "custom", path: [...path, index, "id"], message: `Duplicate id ${option.id}` });
        }
        ids.add(option.id);
        check(option.next, depth + 1, [...path, index, "next"]);
      });
    };
    check(tree.options, 1, ["options"]);
  });

type SentenceTree = zod.infer<typeof SentenceTreeSchema>;


/** Every complete sentence of the tree, with the trait of each pick in order. */
function sentencesOf(tree: SentenceTree): { text: string; traits: SentenceOption["trait"][] }[] {
  const walk = (options: SentenceOption[], words: string[], traits: SentenceOption["trait"][]): ReturnType<typeof sentencesOf> =>
    options.flatMap((option) =>
      option.next.length === 0
        ? [{ text: `${[...words, option.text].join(" ")}.`, traits: [...traits, option.trait] }]
        : walk(option.next, [...words, option.text], [...traits, option.trait]),
    );
  return walk(tree.options, [tree.starter], []);
}


export { BRANCHING, SentenceOptionSchema, SentenceTreeSchema, sentencesOf };
export type { SentenceOption, SentenceTree };
