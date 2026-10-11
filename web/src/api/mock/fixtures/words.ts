import { sentenceTree } from "../../../content/index.ts";

/**
 * MOCK DATA. Stand-in for the sentence question in api/. The mock serves the
 * bundled tree as its "generated" one; the real tree comes from the Agents
 * context (GET /sentence-tree).
 */
const SENTENCE_QUESTION = {
  id: "sentence-i",
  starter: sentenceTree.starter,
  picks: sentenceTree.picks,
} as const;

export { SENTENCE_QUESTION };
