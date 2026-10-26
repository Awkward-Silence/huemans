import { SentenceOptionDraft, SentenceTreeDraft } from '@Huemans/Agents/Domain/SentenceTreeDraft';

const WORDS = ['loudly', 'happily', 'secretly', 'politely'];

// A complete draft, `branching` options per pick for `picks` picks: "loudly", "happily"... with a letter per depth.
export function completeDraft(picks = 5, branching = 3): SentenceTreeDraft {
  const grow = (depth: number): SentenceOptionDraft[] =>
    WORDS.slice(0, branching).map((word) => ({
      text: `${word} ${'abcde'[depth]}`,
      trait: 'curious',
      next: depth + 1 < picks ? grow(depth + 1) : [],
    }));
  return grow(0);
}

export function textsOf(options: readonly { text: string }[]): string[] {
  return options.map((option) => option.text);
}
