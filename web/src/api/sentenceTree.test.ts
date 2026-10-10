import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sentenceTree as bundledTree } from "../content/index.ts";
import type { SentenceTree } from "../domain/sentence.ts";
import { ApiError } from "./errors.ts";
import { createSentenceTreeLoader } from "./sentenceTree.ts";

const apiTree: SentenceTree = { ...bundledTree, starter: "I (from the API)" };
const offline = () => Promise.reject(new ApiError("network", "offline"));
const never = () => new Promise<never>(() => {});

describe("sentence tree loader", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("uses the loaded tree straight away once it has arrived", async () => {
    const loader = createSentenceTreeLoader(() => Promise.resolve(apiTree), bundledTree);
    await loader.load();
    expect(loader.current()).toBe(apiTree);
    await expect(loader.choose()).resolves.toBe(apiTree);
  });

  it("retries a failed load, then keeps the tree", async () => {
    const fetchTree = vi
      .fn<(signal: AbortSignal) => Promise<SentenceTree>>()
      .mockImplementationOnce(offline)
      .mockImplementationOnce(offline)
      .mockResolvedValue(apiTree);
    const loader = createSentenceTreeLoader(fetchTree, bundledTree, { retryDelayMs: 100 });

    const loaded = loader.load();
    await vi.advanceTimersByTimeAsync(100 + 200);
    await expect(loaded).resolves.toBe(apiTree);
    expect(fetchTree).toHaveBeenCalledTimes(3);
  });

  it("falls back to the bundled tree after the last retry fails", async () => {
    const fetchTree = vi.fn(offline);
    const loader = createSentenceTreeLoader(fetchTree, bundledTree, {
      retries: 3,
      retryDelayMs: 100,
    });

    void loader.load();
    await vi.advanceTimersByTimeAsync(100 + 200 + 400);
    expect(fetchTree).toHaveBeenCalledTimes(4);
    expect(loader.current()).toBe(bundledTree);
    await expect(loader.choose()).resolves.toBe(bundledTree);
  });

  it("waits a moment for a tree that is still loading", async () => {
    let arrive: (tree: SentenceTree) => void = () => {};
    const loader = createSentenceTreeLoader(
      () => new Promise((resolve) => (arrive = resolve)),
      bundledTree,
    );
    void loader.load();

    const chosen = loader.choose();
    await vi.advanceTimersByTimeAsync(300);
    arrive(apiTree);
    await expect(chosen).resolves.toBe(apiTree);
  });

  it("gives up after 400ms, cancels the request and sticks with the bundled tree", async () => {
    const signals: AbortSignal[] = [];
    const loader = createSentenceTreeLoader((signal) => {
      signals.push(signal);
      return never();
    }, bundledTree);
    void loader.load();

    const chosen = loader.choose();
    await vi.advanceTimersByTimeAsync(399);
    expect(loader.current()).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    await expect(chosen).resolves.toBe(bundledTree);
    expect(signals[0]!.aborted).toBe(true);
    expect(loader.current()).toBe(bundledTree);
  });

  it("does not retry once cancelled", async () => {
    const fetchTree = vi.fn((signal: AbortSignal) => {
      return new Promise<SentenceTree>((_, reject) =>
        signal.addEventListener("abort", () => reject(new ApiError("network", "aborted"))),
      );
    });
    const loader = createSentenceTreeLoader(fetchTree, bundledTree);
    void loader.load();

    const chosen = loader.choose();
    await vi.advanceTimersByTimeAsync(400);
    await expect(chosen).resolves.toBe(bundledTree);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchTree).toHaveBeenCalledTimes(1);
  });

  it("makes one choice when asked twice at once", async () => {
    const loader = createSentenceTreeLoader(never, bundledTree);
    void loader.load();
    const first = loader.choose();
    const second = loader.choose();
    await vi.advanceTimersByTimeAsync(400);
    expect(await first).toBe(await second);
  });

  it("starts the load itself when it was never started", async () => {
    const fetchTree = vi.fn(() => Promise.resolve(apiTree));
    const loader = createSentenceTreeLoader(fetchTree, bundledTree);
    await expect(loader.choose()).resolves.toBe(apiTree);
    expect(fetchTree).toHaveBeenCalledTimes(1);
  });
});
