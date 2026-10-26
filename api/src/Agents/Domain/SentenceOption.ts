import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';
import { SentenceOptionDraft } from './SentenceTreeDraft';
import { SentenceOptionView } from './SentenceTreeView';
import { SentenceText } from './ValueObject/SentenceText';

/** How many options the attendee chooses from at every pick. */
export const BRANCHING = 3;

/** One selectable pick: its text, the trait it hints at, and the options that follow it. */
export class SentenceOption {
  private constructor(
    readonly text: SentenceText,
    readonly trait: Trait,
    readonly next: readonly SentenceOption[],
  ) {}

  /**
   * The first BRANCHING usable options of `drafts`, each grown `picksLeft - 1`
   * more picks deep. A draft is skipped when its text or trait is invalid, it
   * repeats a sibling's text, or its own options can't be grown. Generated
   * trees are rarely perfect, so one bad branch costs that branch, not the tree.
   */
  static grow(drafts: readonly SentenceOptionDraft[] | undefined, picksLeft: number, path: string): SentenceOption[] {
    const options: SentenceOption[] = [];
    for (const draft of drafts ?? []) {
      if (options.length === BRANCHING) break;
      const option = SentenceOption.tryGrow(draft, picksLeft);
      if (option && !options.some((sibling) => sibling.text.sameWordsAs(option.text))) {
        options.push(option);
      }
    }
    if (options.length < BRANCHING) {
      throw new InvalidArgumentError(`Expected ${BRANCHING} usable options at <${path}>, got ${options.length}`);
    }
    return options;
  }

  private static tryGrow(draft: SentenceOptionDraft, picksLeft: number): SentenceOption | null {
    try {
      const next = picksLeft > 1 ? SentenceOption.grow(draft.next, picksLeft - 1, draft.text) : [];
      return new SentenceOption(new SentenceText(draft.text), new Trait(draft.trait), next);
    } catch (error) {
      if (error instanceof InvalidArgumentError) return null;
      throw error;
    }
  }

  toDTO(id: string): SentenceOptionView {
    return {
      id,
      text: this.text.value,
      trait: this.trait.value,
      next: this.next.map((option, index) => option.toDTO(`${id}.${index + 1}`)),
    };
  }
}
