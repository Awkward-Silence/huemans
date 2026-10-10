import { Icebreaker } from './Icebreaker';
import { PersonalityTypes } from './PersonalityTypes';
import { Question } from './Question';

/** Everything the seed authors at once: the content files mapped into the aggregates. */
export interface AuthoredCatalog {
  questions: Question[];
  icebreakers: Icebreaker[];
  personalityTypes: PersonalityTypes;
}
