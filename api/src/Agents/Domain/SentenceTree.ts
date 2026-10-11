import { SentenceOption } from './SentenceOption';
import { SentenceTreeDraft } from './SentenceTreeDraft';
import { SentenceTreeView } from './SentenceTreeView';

const TREE_ID = 'sentence-i';
const STARTER = 'I';
/** Picks after the starter; with 3 options per pick the tree holds 3^5 = 243 sentences. */
export const PICKS = 5;

/**
 * The "I ..." sentence tree: a fixed starter, then PICKS picks of 3 options
 * each, so every path from the root to a leaf reads as one sentence.
 */
export class SentenceTree {
  private constructor(private readonly options: readonly SentenceOption[]) {}

  /** A complete tree from a generated draft; throws InvalidArgumentError when no complete tree fits in it. */
  static grow(draft: SentenceTreeDraft): SentenceTree {
    return new SentenceTree(SentenceOption.grow(draft, PICKS, STARTER));
  }

  toDTO(): SentenceTreeView {
    return {
      id: TREE_ID,
      starter: STARTER,
      picks: PICKS,
      options: this.options.map((option, index) => option.toDTO(`${index + 1}`)),
    };
  }
}
