import { SentenceAnswer } from '../ValueObject/SentenceAnswer';
import { SentenceTraits } from '../ValueObject/SentenceTraits';

export const SENTENCE_TRAIT_WEIGHER = Symbol('SentenceTraitWeigher');

export interface SentenceTraitWeigher {
  /** Never throws and never blocks for long: SentenceTraits.none() when the AI is off, slow or failing. */
  weigh(sentence: SentenceAnswer): Promise<SentenceTraits>;
}
