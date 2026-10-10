/**
 * The "I ..." sentence: the starter plus the words the attendee picked.
 * It is fun only and never leaves the phone.
 */

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

/** Long words or a long sentence get a smaller type size instead of clipping. */
const isLongSentence = (sentence: readonly string[]) =>
  sentence.join(" ").length > 32 || sentence.some((word) => word.length > 11);

export { isLongSentence, pickWords };
