import { PersonalityType } from '@Huemans/Shared/Domain/ValueObject/PersonalityType';
import { Icebreaker } from '../Icebreaker';
import { PersonalityTypeProfile } from '../PersonalityTypeProfile';
import { Question } from '../Question';
import { TraitTypeMapping } from '../TraitTypeMapping';

export const CATALOG_REPOSITORY = Symbol('CatalogRepository');

/** Simple named reads; each consuming context makes its own selection from the full lists. */
export interface CatalogRepository {
  /** Ordered by id, answers in authored order. */
  allQuestions(): Promise<Question[]>;
  /** Ordered by id. */
  allIcebreakers(): Promise<Icebreaker[]>;
  /** Throws PersonalityTypeProfileNotFound when the catalog has not been seeded. */
  profileOf(type: PersonalityType): Promise<PersonalityTypeProfile>;
  mapping(): Promise<TraitTypeMapping>;
}
