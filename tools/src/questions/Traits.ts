import * as zod from "zod";


/** The fixed set of character traits an answer can point to. */
const TRAITS = [
  "adventurous",
  "ambitious",
  "analytical",
  "cautious",
  "chaotic",
  "comfort-loving",
  "competitive",
  "creative",
  "curious",
  "diplomatic",
  "dramatic",
  "easygoing",
  "empathetic",
  "generous",
  "honest",
  "humorous",
  "independent",
  "introverted",
  "loyal",
  "nostalgic",
  "optimistic",
  "organized",
  "patient",
  "perfectionist",
  "practical",
  "rebellious",
  "romantic",
  "skeptical",
  "sociable",
  "spontaneous",
  "stubborn",
  "thrifty",
  "traditional",
] as const;

const TraitSchema = zod.enum(TRAITS);

type Trait = zod.infer<typeof TraitSchema>;


export { TRAITS, TraitSchema };
export type { Trait };
