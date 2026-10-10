import { Icebreaker } from '../Icebreaker';
import { PersonalityTypes } from '../PersonalityTypes';
import { Question } from '../Question';

export const CATALOG_REPOSITORY = Symbol('CatalogRepository');

/** Simple named reads (each consuming context makes its own selection from the full lists), and the seed's writes. */
export interface CatalogRepository {
  /** Ordered by id, answers in authored order. */
  allQuestions(): Promise<Question[]>;
  /** Ordered by id. */
  allIcebreakers(): Promise<Icebreaker[]>;
  /** Throws PersonalityTypesNotDefined when the catalog has not been seeded. */
  personalityTypes(): Promise<PersonalityTypes>;
  saveQuestions(questions: Question[]): Promise<void>;
  saveIcebreakers(icebreakers: Icebreaker[]): Promise<void>;
  savePersonalityTypes(personalityTypes: PersonalityTypes): Promise<void>;
}
