import { useEffect, useState } from "react";
import { sentenceTree as bundledTree } from "../content/index.ts";
import type { SentenceTree } from "../domain/sentence.ts";
import { api } from "./index.ts";

type SentenceTreeLoaderOptions = {
  /** Retries after the first attempt, waiting retryDelayMs, then twice that, and so on. */
  retries: number;
  retryDelayMs: number;
  /** How long the sentence step waits for a tree still loading before it gives up on it. */
  waitMs: number;
};

const DEFAULT_OPTIONS: SentenceTreeLoaderOptions = { retries: 3, retryDelayMs: 1_000, waitMs: 400 };

const TIMED_OUT = Symbol("timed out");

/** Resolves after `ms`, or as soon as `signal` aborts. */
function pause(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => (clearTimeout(timer), resolve()), { once: true });
  });
}

/**
 * The tree for the "I ..." sentence step: the one api/ generates, or the
 * bundled `fallback` when it can't be had in time.
 *
 * `load()` starts fetching at bootstrap, retrying failures. The first time
 * the step asks (`choose()`), the choice is made once for the whole visit:
 * a loaded tree is used; a failed load means the fallback; a load still
 * running gets `waitMs` more, after which it is cancelled and the fallback
 * is used. Later calls return the same tree, so the words never change
 * under the attendee.
 */
function createSentenceTreeLoader(
  fetchTree: (signal: AbortSignal) => Promise<SentenceTree>,
  fallback: SentenceTree,
  overrides: Partial<SentenceTreeLoaderOptions> = {},
) {
  const options = { ...DEFAULT_OPTIONS, ...overrides };
  const controller = new AbortController();
  let loading: Promise<SentenceTree | undefined> | undefined;
  /** Set once the load ends: the tree, or the fallback after a failure. */
  let loaded: SentenceTree | undefined;
  let chosen: SentenceTree | undefined;
  let choosing: Promise<SentenceTree> | undefined;

  async function fetchWithRetries(): Promise<SentenceTree | undefined> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await fetchTree(controller.signal);
      } catch {
        if (controller.signal.aborted || attempt >= options.retries) return undefined;
      }
      await pause(options.retryDelayMs * 2 ** attempt, controller.signal);
      if (controller.signal.aborted) return undefined;
    }
  }

  function load(): Promise<SentenceTree | undefined> {
    loading ??= fetchWithRetries().then((tree) => {
      loaded = tree ?? fallback;
      return tree;
    });
    return loading;
  }

  /** The chosen tree, or the loaded one when the load has already ended; undefined while undecided. */
  function current(): SentenceTree | undefined {
    chosen ??= loaded;
    return chosen;
  }

  function choose(): Promise<SentenceTree> {
    const settled = current();
    if (settled) return Promise.resolve(settled);
    choosing ??= Promise.race([
      load(),
      new Promise<typeof TIMED_OUT>((resolve) => setTimeout(resolve, options.waitMs, TIMED_OUT)),
    ]).then((tree) => {
      if (tree === TIMED_OUT) controller.abort();
      chosen ??= tree === TIMED_OUT || tree === undefined ? fallback : tree;
      return chosen;
    });
    return choosing;
  }

  return { load, current, choose };
}

type SentenceTreeLoader = ReturnType<typeof createSentenceTreeLoader>;

/** The app's loader; `main.tsx` starts it. */
const sentenceTreeLoader = createSentenceTreeLoader(
  (signal) => api.getSentenceTree(signal),
  bundledTree,
);

/** The sentence step's tree; undefined only during the short wait for a tree still loading. */
function useSentenceTree(
  loader: SentenceTreeLoader = sentenceTreeLoader,
): SentenceTree | undefined {
  const [tree, setTree] = useState(() => loader.current());
  useEffect(() => {
    if (tree) return;
    let live = true;
    void loader.choose().then((chosen) => live && setTree(chosen));
    return () => {
      live = false;
    };
  }, [tree, loader]);
  return tree;
}

export { createSentenceTreeLoader, sentenceTreeLoader, useSentenceTree };
export type { SentenceTreeLoader, SentenceTreeLoaderOptions };
