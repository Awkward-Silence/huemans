import { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';

export interface SentenceOptionView {
  /** The option's path from the root, 1-based: "2.1.3". */
  id: string;
  text: string;
  trait: TraitValue;
  next: SentenceOptionView[];
}

/** Same shape as tools/src/sentences/sentences.test.json. */
export interface SentenceTreeView {
  id: string;
  starter: string;
  picks: number;
  options: SentenceOptionView[];
}
