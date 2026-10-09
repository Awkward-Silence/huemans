import { readFileSync } from "node:fs";
import { QuestionListSchema } from "./QuestionList.ts";
import { TRAITS } from "./Traits.ts";


const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx src/questions/validate.ts <questions.json>");
  process.exit(1);
}

const result = QuestionListSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
if (!result.success) {
  console.error(result.error.issues);
  process.exit(1);
}

const counts = new Map<string, number>(TRAITS.map((trait) => [trait, 0]));
for (const question of result.data) {
  for (const answer of question.answers) {
    counts.set(answer.trait, counts.get(answer.trait)! + 1);
  }
}

console.log(`${result.data.length} questions OK`);
console.log([...counts].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}: ${n}`).join(", "));
