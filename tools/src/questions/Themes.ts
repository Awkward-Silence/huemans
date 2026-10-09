import * as zod from "zod";


/** The fixed set of themes a question can belong to. */
const THEMES = [
  "animals",
  "awkward-moments",
  "celebrations",
  "childhood",
  "food",
  "friendship",
  "future",
  "home",
  "hypothetical",
  "love",
  "money",
  "music-and-movies",
  "nature",
  "school",
  "shopping",
  "sports",
  "technology",
  "travel",
  "weekend",
  "work",
] as const;

const ThemeSchema = zod.enum(THEMES);

type Theme = zod.infer<typeof ThemeSchema>;


export { THEMES, ThemeSchema };
export type { Theme };
