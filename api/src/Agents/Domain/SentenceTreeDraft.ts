/**
 * A proposed tree as a generator returns it, before validation: plain data
 * with no ids. `next` is absent or empty at the last pick.
 */
export interface SentenceOptionDraft {
  text: string;
  trait: string;
  next?: SentenceOptionDraft[];
}

export type SentenceTreeDraft = SentenceOptionDraft[];
