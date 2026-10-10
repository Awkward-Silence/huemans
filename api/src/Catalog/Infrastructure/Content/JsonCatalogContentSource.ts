import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { Answer } from '@Huemans/Catalog/Domain/Answer';
import { AuthoredCatalog } from '@Huemans/Catalog/Domain/AuthoredCatalog';
import { Icebreaker } from '@Huemans/Catalog/Domain/Icebreaker';
import { PersonalityTypeProfile } from '@Huemans/Catalog/Domain/PersonalityTypeProfile';
import { PersonalityTypes } from '@Huemans/Catalog/Domain/PersonalityTypes';
import { CatalogContentSource } from '@Huemans/Catalog/Domain/Port/CatalogContentSource';
import { Question } from '@Huemans/Catalog/Domain/Question';
import { AnswerCollection } from '@Huemans/Catalog/Domain/ValueObject/AnswerCollection';
import { AnswerId } from '@Huemans/Catalog/Domain/ValueObject/AnswerId';
import { AnswerText } from '@Huemans/Catalog/Domain/ValueObject/AnswerText';
import { Blurb } from '@Huemans/Catalog/Domain/ValueObject/Blurb';
import { IcebreakerId } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerId';
import { IcebreakerText } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerText';
import { IcebreakerTraitCollection } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerTraitCollection';
import { Nickname } from '@Huemans/Catalog/Domain/ValueObject/Nickname';
import { PersonalityTypeProfileCollection } from '@Huemans/Catalog/Domain/ValueObject/PersonalityTypeProfileCollection';
import { ProfileTraitCollection } from '@Huemans/Catalog/Domain/ValueObject/ProfileTraitCollection';
import { QuestionId } from '@Huemans/Catalog/Domain/ValueObject/QuestionId';
import { QuestionText } from '@Huemans/Catalog/Domain/ValueObject/QuestionText';
import { Theme } from '@Huemans/Catalog/Domain/ValueObject/Theme';
import { TraitType } from '@Huemans/Catalog/Domain/ValueObject/TraitType';
import { TraitTypeMapping } from '@Huemans/Catalog/Domain/ValueObject/TraitTypeMapping';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { IcebreakerListSchema } from './IcebreakerList';
import { InvalidCatalogContent } from './InvalidCatalogContent';
import { PersonalityTypeProfileListSchema } from './PersonalityTypeProfileList';
import { QuestionListSchema } from './QuestionList';
import { TraitTypeMappingContentSchema } from './TraitTypeMappingContent';

// Resolved from this module, not the working directory, so the seed finds them from src/ and from dist/
// (nest-cli.json copies them as assets).
export const DEFAULT_CATALOG_FILES = {
  questions: join(__dirname, 'questions.json'),
  icebreakers: join(__dirname, 'icebreakers.json'),
  profiles: join(__dirname, 'profiles.json'),
  mapping: join(__dirname, 'trait-types.json'),
};

export type CatalogFilePaths = typeof DEFAULT_CATALOG_FILES;

/**
 * Maps the content files into the aggregates, entry by entry, so a broken rule is reported with the file, the entry
 * and the field it is in. Throws before returning anything if any entry is invalid.
 */
export class JsonCatalogContentSource implements CatalogContentSource {
  constructor(private readonly paths: CatalogFilePaths = DEFAULT_CATALOG_FILES) {}

  read(): AuthoredCatalog {
    return {
      questions: this.questions(),
      icebreakers: this.icebreakers(),
      personalityTypes: this.personalityTypes(),
    };
  }

  private questions(): Question[] {
    const problems = new Problems();
    const questions = parseFile(QuestionListSchema, this.paths.questions).map((entry) =>
      problems.collect(entry.id, () =>
        Question.author(
          problems.at('id', () => new QuestionId(entry.id)),
          problems.at('theme', () => new Theme(entry.theme)),
          problems.at('text', () => new QuestionText(entry.text)),
          problems.at(
            'answers',
            () =>
              new AnswerCollection(
                entry.answers.map(
                  (answer, index) =>
                    new Answer(
                      problems.at(`answers.${index}.id`, () => new AnswerId(answer.id)),
                      problems.at(`answers.${index}.text`, () => new AnswerText(answer.text)),
                      problems.at(`answers.${index}.trait`, () => new Trait(answer.trait)),
                    ),
                ),
              ),
          ),
        ),
      ),
    );
    return problems.all(this.paths.questions, questions);
  }

  private icebreakers(): Icebreaker[] {
    const problems = new Problems();
    const icebreakers = parseFile(IcebreakerListSchema, this.paths.icebreakers).map((entry) =>
      problems.collect(entry.id, () =>
        Icebreaker.author(
          problems.at('id', () => new IcebreakerId(entry.id)),
          problems.at('theme', () => new Theme(entry.theme)),
          problems.at('text', () => new IcebreakerText(entry.text)),
          problems.at('traits', () => new IcebreakerTraitCollection(entry.traits.map((trait) => new Trait(trait)))),
        ),
      ),
    );
    return problems.all(this.paths.icebreakers, icebreakers);
  }

  private personalityTypes(): PersonalityTypes {
    const mappingProblems = new Problems();
    const mapping = mappingProblems.collect(
      'mapping',
      () =>
        new TraitTypeMapping(
          Object.entries(parseFile(TraitTypeMappingContentSchema, this.paths.mapping)).map(
            ([trait, type]) =>
              new TraitType(
                mappingProblems.at(trait, () => new Trait(trait)),
                mappingProblems.at(trait, () => new PersonalityType(type)),
              ),
          ),
        ),
    );
    const validMapping = mappingProblems.one(this.paths.mapping, mapping);

    const problems = new Problems();
    const profiles = parseFile(PersonalityTypeProfileListSchema, this.paths.profiles).map((entry) =>
      problems.collect(
        entry.type,
        () =>
          new PersonalityTypeProfile(
            problems.at('type', () => new PersonalityType(entry.type)),
            problems.at('nickname', () => new Nickname(entry.nickname)),
            problems.at('blurb', () => new Blurb(entry.blurb)),
            problems.at('traits', () => new ProfileTraitCollection(entry.traits.map((trait) => new Trait(trait)))),
          ),
      ),
    );
    const personalityTypes = problems.collect('profiles', () =>
      PersonalityTypes.define(
        validMapping,
        new PersonalityTypeProfileCollection(problems.all(this.paths.profiles, profiles)),
      ),
    );
    return problems.one(this.paths.profiles, personalityTypes);
  }
}

/** Collects the broken rules of a file, each named by its entry and field, instead of stopping at the first one. */
class Problems {
  private readonly found: string[] = [];
  private entry = '';

  collect<T>(entry: string, build: () => T): T | undefined {
    this.entry = entry;
    try {
      return build();
    } catch (error) {
      return this.record('', error);
    }
  }

  at<T>(field: string, build: () => T): T {
    try {
      return build();
    } catch (error) {
      this.record(field, error);
      throw new FieldAlreadyRecorded();
    }
  }

  all<T>(path: string, results: (T | undefined)[]): T[] {
    this.throwIfAny(path);
    return results as T[];
  }

  one<T>(path: string, result: T | undefined): T {
    this.throwIfAny(path);
    return result as T;
  }

  private throwIfAny(path: string): void {
    if (this.found.length > 0) {
      throw new InvalidCatalogContent(path, this.found);
    }
  }

  private record(field: string, error: unknown): undefined {
    if (error instanceof FieldAlreadyRecorded) {
      return undefined;
    }
    if (!(error instanceof InvalidArgumentError)) {
      throw error;
    }
    this.found.push(`${[this.entry, field].filter(Boolean).join(' ')}: ${error.message}`);
    return undefined;
  }
}

// Stops building an entry once one of its fields was recorded as a problem, without recording it twice.
class FieldAlreadyRecorded extends Error {}

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
