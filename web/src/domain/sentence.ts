/**
 * The "I ..." sentence: the starter plus the words the attendee picked.
 * It is submitted with the answers, where api/ may weigh its traits.
 */

/** One option of the sentence tree: a word or a short group of words. */
type SentenceOption = { text: string; next: readonly SentenceOption[] };

type SentenceTree = { starter: string; picks: number; options: readonly SentenceOption[] };

/**
 * The tree's options for the next pick after `picks` (starter excluded), or
 * undefined when the picks leave the tree or the sentence is complete.
 */
function treeOptions(tree: SentenceTree, picks: readonly string[]): string[] | undefined {
  let options = tree.options;
  for (const pick of picks) {
    const match = options.find((option) => option.text.toLowerCase() === pick.toLowerCase());
    if (!match) return undefined;
    options = match.next;
  }
  return options.length > 0 ? options.map((option) => option.text) : undefined;
}

/** Every distinct option of the tree at pick `index` (0-based). */
function treeWordsAt(tree: SentenceTree, index: number): string[] {
  let level = tree.options;
  for (let depth = 0; depth < index; depth++) level = level.flatMap((option) => option.next);
  return [...new Set(level.map((option) => option.text))];
}

/** Words already in the sentence, compared without case. */
const usedWords = (sentence: readonly string[]) =>
  new Set(sentence.map((word) => word.toLowerCase()));

/**
 * `count` distinct words from `pool`, in random order, skipping any word
 * already in the sentence. Returns fewer when the pool runs out.
 */
function pickWords(
  pool: readonly string[],
  sentence: readonly string[],
  count = 3,
  random: () => number = Math.random,
): string[] {
  const used = usedWords(sentence);
  const candidates = pool.filter((word) => {
    const key = word.toLowerCase();
    if (used.has(key)) return false;
    used.add(key);
    return true;
  });
  const picked: string[] = [];
  while (picked.length < count && candidates.length > 0) {
    picked.push(candidates.splice(Math.floor(random() * candidates.length), 1)[0]!);
  }
  return picked;
}

/**
 * 3 words for the next pick of `sentence` (starter included): the tree's
 * options while the picks follow it, otherwise random words from the same
 * step of the tree (picks from elsewhere, e.g. the AI, can leave the tree).
 */
function nextWords(
  tree: SentenceTree,
  sentence: readonly string[],
  random: () => number = Math.random,
): string[] {
  const picks = sentence.slice(1);
  const onTree = treeOptions(tree, picks);
  if (onTree) return onTree;
  const step = Math.min(picks.length, tree.picks - 1);
  return pickWords(treeWordsAt(tree, step), sentence, 3, random);
}

/** Long words or a long sentence get a smaller type size instead of clipping. */
const isLongSentence = (sentence: readonly string[]) =>
  sentence.join(" ").length > 32 || sentence.some((word) => word.length > 11);

export { isLongSentence, nextWords, pickWords, treeOptions, treeWordsAt };
export type { SentenceOption, SentenceTree };
