import { SentenceTreeDraft } from '../SentenceTreeDraft';

export const SENTENCE_TREE_GENERATOR = Symbol('SentenceTreeGenerator');

export interface SentenceTreeGenerator {
  /** A freshly generated draft; throws SentenceTreeUnavailable when it can never succeed (e.g. no key). */
  generate(): Promise<SentenceTreeDraft>;
}
