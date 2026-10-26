import type { SentenceTree } from "../domain/sentence.ts";
import tree from "./sentenceTree.json";

/**
 * The bundled "I ..." sentence tree: every pick offers 3 options, and each
 * option leads to its own 3 next options, so every path reads as a sentence.
 * The sentence step uses the tree api/ generates when it has one, and this
 * one otherwise (see api/sentenceTree.ts). A verbatim copy of
 * tools/src/sentences/sentences.test.json (re-copy it when that file
 * changes). The traits are unused here: only the finished sentence is sent on
 * submit, and api/ has Jev weigh it.
 */
const sentenceTree: SentenceTree = tree;

export { sentenceTree };
