import { readFileSync } from "node:fs";
import { IcebreakerListSchema } from "./IcebreakerList.ts";
import { THEMES } from "../questions/Themes.ts";
import { TRAITS } from "../questions/Traits.ts";


const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx src/icebreakers/validate.ts <icebreakers.json>");
  process.exit(1);
}

const result = IcebreakerListSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
if (!result.success) {
  console.error(result.error.issues);
  process.exit(1);
}

const themeCounts = new Map<string, number>(THEMES.map((theme) => [theme, 0]));
const traitCounts = new Map<string, number>(TRAITS.map((trait) => [trait, 0]));
for (const icebreaker of result.data) {
  themeCounts.set(icebreaker.theme, themeCounts.get(icebreaker.theme)! + 1);
  for (const trait of icebreaker.traits) {
    traitCounts.set(trait, traitCounts.get(trait)! + 1);
  }
}

const format = (counts: Map<string, number>) =>
  [...counts].sort((a, b) => b[1] - a[1]).map(([name, n]) => `${name}: ${n}`).join(", ");

console.log(`${result.data.length} icebreakers OK`);
console.log(`Themes: ${format(themeCounts)}`);
console.log(`Traits: ${format(traitCounts)}`);
