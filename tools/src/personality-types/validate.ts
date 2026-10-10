import { readFileSync } from "node:fs";
import { PersonalityTypeProfileListSchema } from "../../../api/src/Catalog/Infrastructure/Content/PersonalityTypeProfileList.ts";
import { checkProfileChips, TraitTypeMappingContentSchema } from "../../../api/src/Catalog/Infrastructure/Content/TraitTypeMappingContent.ts";
import { PERSONALITY_TYPES } from "../../../api/src/Shared/Domain/ValueObject/PersonalityType.ts";

const [profilesFile, mappingFile] = process.argv.slice(2);
if (!profilesFile || !mappingFile) {
  console.error("Usage: npx tsx src/personality-types/validate.ts <profiles.json> <trait-types.json>");
  process.exit(1);
}

const profiles = PersonalityTypeProfileListSchema.safeParse(JSON.parse(readFileSync(profilesFile, "utf8")));
const mapping = TraitTypeMappingContentSchema.safeParse(JSON.parse(readFileSync(mappingFile, "utf8")));
if (!profiles.success || !mapping.success) {
  console.error(profiles.error?.issues ?? [], mapping.error?.issues ?? []);
  process.exit(1);
}

const problems = checkProfileChips(profiles.data, mapping.data);
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const traitsPerType = PERSONALITY_TYPES.map(
  (type) => `${type}: ${Object.values(mapping.data).filter((mapped) => mapped === type).length}`,
);
console.log(`${profiles.data.length} profiles and ${Object.keys(mapping.data).length} mapped traits OK`);
console.log(`Traits per type: ${traitsPerType.join(", ")}`);
