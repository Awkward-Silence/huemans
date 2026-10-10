import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { Icebreaker, IcebreakerListSchema } from '@Huemans/Types/Icebreaker';
import { Question, QuestionListSchema } from '@Huemans/Types/Question';

// Relative to api/, where the scripts run. Reading the files is not a runtime import of tools/.
export const DEFAULT_QUESTIONS_FILE = '../tools/src/questions/questions.test.json';
export const DEFAULT_ICEBREAKERS_FILE = '../tools/src/icebreakers/icebreakers.test.json';

export class InvalidCatalogFile extends Error {
  constructor(path: string, problems: string[]) {
    super(`${path} is invalid:\n  ${problems.join('\n  ')}`);
    this.name = new.target.name;
  }
}

/** Reads and validates both files; throws before anything is written if either is invalid. */
export function readCatalogFiles(
  questionsPath: string,
  icebreakersPath: string,
): { questions: Question[]; icebreakers: Icebreaker[] } {
  return {
    questions: parseFile(QuestionListSchema, questionsPath),
    icebreakers: parseFile(IcebreakerListSchema, icebreakersPath),
  };
}

function parseFile<T>(schema: z.ZodType<T[]>, path: string): T[] {
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
  const result = schema.safeParse(raw);
  if (result.success) {
    return result.data;
  }
  throw new InvalidCatalogFile(
    path,
    result.error.issues.map((issue) => {
      const [index, ...rest] = issue.path;
      return `${entryName(raw, index)} ${rest.join('.')}: ${issue.message}`.trim();
    }),
  );
}

// Names an entry by its id when it has one, so the problem is easy to find in the file.
function entryName(raw: unknown, index: PropertyKey | undefined): string {
  const entry: unknown = Array.isArray(raw) && typeof index === 'number' ? raw[index] : undefined;
  const id = typeof entry === 'object' && entry !== null && 'id' in entry ? entry.id : undefined;
  return typeof id === 'string' ? id : `entry ${String(index ?? '')}`.trim();
}
