import { IcebreakerCandidate } from '../ValueObject/IcebreakerCandidate';

export const ICEBREAKER_CATALOG = Symbol('IcebreakerCatalog');

export interface IcebreakerCatalog {
  candidates(): Promise<IcebreakerCandidate[]>;
}
