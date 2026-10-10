import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./errors.ts";
import { fallbackSuggestions, suggestionsOrFallback } from "./wordSuggestions.ts";

const sentence = ["I", "secretly"];

describe("suggestionsOrFallback", () => {
  afterEach(() => vi.useRealTimers());

  it("passes fast suggestions through", async () => {
    const fast = Promise.resolve({ words: ["lick", "hug", "fear"], source: "ai" as const });
    await expect(suggestionsOrFallback(fast, sentence)).resolves.toEqual({
      words: ["lick", "hug", "fear"],
      source: "ai",
    });
  });

  it("falls back to 3 local words when the request fails", async () => {
    const failed = Promise.reject(new ApiError("network", "offline"));
    const result = await suggestionsOrFallback(failed, sentence);
    expect(result.source).toBe("fallback");
    expect(result.words).toHaveLength(3);
  });

  it("falls back when the request is slower than the timeout", async () => {
    vi.useFakeTimers();
    const slow = new Promise<never>(() => {});
    const result = suggestionsOrFallback(slow, sentence, 1_500);
    await vi.advanceTimersByTimeAsync(1_500);
    await expect(result).resolves.toMatchObject({ source: "fallback" });
  });
});

describe("fallbackSuggestions", () => {
  it("has 3 fresh words for every pick", () => {
    const sentences = [["I"], ["I", "secretly"], ["I", "secretly", "lick"], ["I", "a", "b", "c"]];
    for (const words of sentences) {
      const { words: next } = fallbackSuggestions(words);
      expect(next).toHaveLength(3);
      for (const word of next) expect(words).not.toContain(word);
    }
  });
});
