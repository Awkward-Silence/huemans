import { readFileSync } from "node:fs";
import { QuestionListSchema } from "../../../api/src/Catalog/Infrastructure/Content/QuestionList.ts";
import { THEMES } from "../../../api/src/Catalog/Domain/ValueObject/Theme.ts";
import { TRAITS } from "../../../api/src/Shared/Domain/ValueObject/Trait.ts";


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

const themeCounts = new Map<string, number>(THEMES.map((theme) => [theme, 0]));
const traitCounts = new Map<string, number>(TRAITS.map((trait) => [trait, 0]));
for (const question of result.data) {
  themeCounts.set(question.theme, themeCounts.get(question.theme)! + 1);
  for (const answer of question.answers) {
    traitCounts.set(answer.trait, traitCounts.get(answer.trait)! + 1);
  }
}

const format = (counts: Map<string, number>) =>
  [...counts].sort((a, b) => b[1] - a[1]).map(([name, n]) => `${name}: ${n}`).join(", ");

console.log(`${result.data.length} questions OK`);
console.log(`Themes: ${format(themeCounts)}`);
console.log(`Traits: ${format(traitCounts)}`);
