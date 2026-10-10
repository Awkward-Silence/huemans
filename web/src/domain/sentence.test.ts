import { describe, expect, it } from "vitest";
import { isLongSentence, pickWords } from "./sentence.ts";

describe("pickWords", () => {
  it("picks distinct words that are not already in the sentence", () => {
    const pool = ["Secretly", "secretly", "once", "never", "I", "still"];
    for (let run = 0; run < 20; run++) {
      const words = pickWords(pool, ["I", "once"]);
      expect(words).toHaveLength(3);
      expect(new Set(words.map((word) => word.toLowerCase())).size).toBe(3);
      expect(words.map((word) => word.toLowerCase())).not.toContain("once");
      expect(words).not.toContain("I");
    }
  });

  it("returns fewer words when the pool runs out", () => {
    expect(pickWords(["once", "never"], ["I"])).toHaveLength(2);
  });
});

describe("isLongSentence", () => {
  it("flags long words and long sentences", () => {
    expect(isLongSentence(["I", "secretly", "lick", "haunted", "spoons"])).toBe(false);
    expect(isLongSentence(["I", "accidentally", "befriended"])).toBe(true);
    expect(isLongSentence(["I", "once", "hugged", "every", "single", "goat", "here"])).toBe(true);
  });
});
