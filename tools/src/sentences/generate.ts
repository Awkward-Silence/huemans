import { readFileSync, writeFileSync } from "node:fs";
import { SentenceTreeSchema, sentencesOf } from "./SentenceTree.ts";


const [file, out] = process.argv.slice(2);
if (!file) {
  console.error("Usage: npx tsx src/sentences/generate.ts <sentences.json> [out.txt]");
  process.exit(1);
}

const result = SentenceTreeSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
if (!result.success) {
  console.error(`${file} is invalid, run validate:sentences first`);
  process.exit(1);
}

// One line per complete sentence, followed by the trait of each pick.
const lines = sentencesOf(result.data).map((sentence) => `${sentence.text}\t${sentence.traits.join(", ")}`);
if (out) {
  writeFileSync(out, `${lines.join("\n")}\n`);
  console.log(`${lines.length} sentences written to ${out}`);
} else {
  console.log(lines.join("\n"));
}
