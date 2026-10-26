// Type-only wire contract for the sentence tree. Import with `import type` only.

/** One pick: a word or short group of words, the trait it hints at, and the 3 options after it (none at the last pick). */
export type SentenceOptionResponse = {
  /** The option's path from the root, 1-based: "2.1.3". */
  id: string;
  text: string;
  trait: string;
  next: SentenceOptionResponse[];
};

/**
 * GET /sentence-tree (200): the night's "I ..." sentence tree, generated once per API process.
 * 503 when no tree can be generated (no ANTHROPIC_API_KEY, provider error); clients fall back to a bundled tree.
 * Same shape as tools/src/sentences/sentences.test.json and the web's SentenceTreeSchema.
 */
export type SentenceTreeResponse = {
  id: string;
  starter: string;
  /** Picks after the starter; every pick offers exactly 3 options. */
  picks: number;
  options: SentenceOptionResponse[];
};
