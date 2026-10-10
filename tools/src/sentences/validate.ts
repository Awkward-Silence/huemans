import { readFileSync } from "node:fs";
import { SentenceTreeSchema, sentencesOf } from "./SentenceTree.ts";
import { TRAITS } from "../../../api/src/Shared/Domain/ValueObject/Trait.ts";


const [file] = process.argv.slice(2);
if (!file) {
  console.error("Usage: npx tsx src/sentences/validate.ts <sentences.json>");
  process.exit(1);
}

const result = SentenceTreeSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
if (!result.success) {
  console.error(result.error.issues);
  process.exit(1);
}

const sentences = sentencesOf(result.data);
const traitCounts = new Map<string, number>(TRAITS.map((trait) => [trait, 0]));
for (const sentence of sentences) {
  for (const trait of sentence.traits) {
    traitCounts.set(trait, traitCounts.get(trait)! + 1);
  }
}
const unused = [...traitCounts].filter(([, n]) => n === 0).map(([trait]) => trait);

console.log(`${sentences.length} sentences OK (${result.data.picks} picks, starter "${result.data.starter}")`);
console.log(`Traits per sentence pick: ${[...traitCounts].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}: ${n}`).join(", ")}`);
if (unused.length > 0) {
  console.log(`Unused traits: ${unused.join(", ")}`);
}
