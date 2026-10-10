import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { IcebreakerListSchema } from '../Content/IcebreakerList';
import { PersonalityTypeProfileListSchema } from '../Content/PersonalityTypeProfileList';
import { QuestionListSchema } from '../Content/QuestionList';
import { checkProfileChips, TraitTypeMappingContentSchema } from '../Content/TraitTypeMappingContent';
import { CatalogContent } from './CatalogContent';

// Relative to api/, where the scripts run. Reading the files is not a runtime import of tools/.
export const DEFAULT_CATALOG_FILES = {
  questions: '../tools/src/questions/questions.test.json',
  icebreakers: '../tools/src/icebreakers/icebreakers.test.json',
  profiles: '../tools/src/personality-types/profiles.json',
  mapping: '../tools/src/personality-types/trait-types.json',
};

export type CatalogFilePaths = typeof DEFAULT_CATALOG_FILES;

export class InvalidCatalogContent extends Error {
  constructor(path: string, problems: string[]) {
    super(`${path} is invalid:\n  ${problems.join('\n  ')}`);
    this.name = new.target.name;
  }
}

/** Reads, validates and cross-checks all four files; throws before anything is written if any check fails. */
export function readCatalogFiles(paths: CatalogFilePaths): CatalogContent {
  const content = {
    questions: parseFile(QuestionListSchema, paths.questions),
    icebreakers: parseFile(IcebreakerListSchema, paths.icebreakers),
    profiles: parseFile(PersonalityTypeProfileListSchema, paths.profiles),
    mapping: parseFile(TraitTypeMappingContentSchema, paths.mapping),
  };
  const chipProblems = checkProfileChips(content.profiles, content.mapping);
  if (chipProblems.length > 0) {
    throw new InvalidCatalogContent(paths.profiles, chipProblems);
  }
  return content;
}

function parseFile<T>(schema: z.ZodType<T>, path: string): T {
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
  const result = schema.safeParse(raw);
  if (result.success) {
    return result.data;
  }
  throw new InvalidCatalogContent(
    path,
    result.error.issues.map((issue) => {
      const [first, ...rest] = issue.path;
      return `${entryName(raw, first)} ${rest.join('.')}: ${issue.message}`.trim();
    }),
  );
}

// Names an entry by its id (questions, icebreakers) or type (profiles), so the problem is easy to find.
function entryName(raw: unknown, key: PropertyKey | undefined): string {
  if (key === undefined) {
    return '';
  }
  const entry: unknown = Array.isArray(raw) && typeof key === 'number' ? raw[key] : undefined;
  if (typeof entry === 'object' && entry !== null) {
    const name = 'id' in entry ? entry.id : 'type' in entry ? entry.type : undefined;
    if (typeof name === 'string') {
      return name;
    }
  }
  return String(key);
}
