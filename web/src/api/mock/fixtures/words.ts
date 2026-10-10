import { sentenceTree } from "../../../content/index.ts";

/**
 * MOCK DATA. Stand-in for the sentence question and the AI word suggester in
 * api/: the mock suggests from the same tree as the fallback. The real words
 * come from the Agents context.
 */
const SENTENCE_QUESTION = {
  id: "sentence-i",
  starter: sentenceTree.starter,
  picks: sentenceTree.picks,
} as const;

export { SENTENCE_QUESTION };
