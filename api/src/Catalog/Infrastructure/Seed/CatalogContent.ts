import type { IcebreakerList } from '../Content/IcebreakerList';
import type { PersonalityTypeProfileContent } from '../Content/PersonalityTypeProfileList';
import type { QuestionList } from '../Content/QuestionList';
import type { TraitTypeMappingContent } from '../Content/TraitTypeMappingContent';

/** All four content files, already validated and cross-checked. */
export interface CatalogContent {
  questions: QuestionList;
  icebreakers: IcebreakerList;
  profiles: PersonalityTypeProfileContent[];
  mapping: TraitTypeMappingContent;
}
