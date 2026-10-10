import type { SentenceTree } from "../domain/sentence.ts";
import tree from "./sentenceTree.json";

/**
 * The "I ..." sentence tree: every pick offers 3 options, and each option
 * leads to its own 3 next options, so every path reads as a sentence.
 * A verbatim copy of tools/src/sentences/sentences.test.json (re-copy it
 * when that file changes). The traits are unused here: the sentence never
 * leaves the phone.
 */
const sentenceTree: SentenceTree = tree;

export { sentenceTree };
