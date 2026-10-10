import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { IcebreakerListSchema } from '../Content/IcebreakerList';
import { PersonalityTypeProfileListSchema } from '../Content/PersonalityTypeProfileList';
import { QuestionListSchema } from '../Content/QuestionList';
import { checkProfileChips, TraitTypeMappingContentSchema } from '../Content/TraitTypeMappingContent';
import { CatalogContent } from './CatalogContent';

// Resolved from this module, not the working directory, so the seed finds them from src/ and from dist/
// (nest-cli.json copies them as assets).
const CONTENT = join(__dirname, '../Content');

export const DEFAULT_CATALOG_FILES = {
  questions: join(CONTENT, 'questions.json'),
  icebreakers: join(CONTENT, 'icebreakers.json'),
  profiles: join(CONTENT, 'profiles.json'),
  mapping: join(CONTENT, 'trait-types.json'),
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
