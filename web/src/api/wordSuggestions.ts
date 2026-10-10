import { sentenceFallbackWords } from "../content/index.ts";
import { pickWords } from "../domain/sentence.ts";
import type { WordSuggestions } from "./schemas.ts";

/** Past this, the sentence step stops waiting and shows its own words. */
const SUGGESTION_TIMEOUT_MS = 1_500;

/** 3 local words for the next pick of `sentence` (starter included). */
function fallbackSuggestions(sentence: readonly string[]): WordSuggestions {
  const lists = sentenceFallbackWords;
  const pool = lists[Math.min(Math.max(sentence.length - 1, 0), lists.length - 1)] ?? [];
  return { words: pickWords(pool, sentence), source: "fallback" };
}

/**
 * The suggestions from `request`, or fallback words if it fails or takes
 * longer than `timeoutMs`. Never rejects, so the step never stalls.
 */
async function suggestionsOrFallback(
  request: Promise<WordSuggestions>,
  sentence: readonly string[],
  timeoutMs = SUGGESTION_TIMEOUT_MS,
): Promise<WordSuggestions> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<undefined>((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });
  try {
    return (await Promise.race([request, timeout])) ?? fallbackSuggestions(sentence);
  } catch {
    return fallbackSuggestions(sentence);
  } finally {
    clearTimeout(timer);
  }
}

export { fallbackSuggestions, SUGGESTION_TIMEOUT_MS, suggestionsOrFallback };
