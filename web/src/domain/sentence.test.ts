import { describe, expect, it } from "vitest";
import { isLongSentence, nextWords, pickWords, treeOptions, treeWordsAt } from "./sentence.ts";

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

describe("sentence tree", () => {
  const leaf = (text: string) => ({ text, next: [] });
  const tree = {
    starter: "I",
    picks: 2,
    options: [
      { text: "hug", next: [leaf("goats"), leaf("owls"), leaf("lamps")] },
      { text: "sing to", next: [leaf("ducks"), leaf("kettles"), leaf("spoons")] },
      { text: "fear", next: [leaf("pigeons"), leaf("moths"), leaf("socks")] },
    ],
  };

  it("offers the options under the picks, ignoring case", () => {
    expect(treeOptions(tree, [])).toEqual(["hug", "sing to", "fear"]);
    expect(treeOptions(tree, ["Sing to"])).toEqual(["ducks", "kettles", "spoons"]);
    expect(treeOptions(tree, ["dance"])).toBeUndefined();
    expect(treeOptions(tree, ["hug", "goats"])).toBeUndefined();
  });

  it("lists every word of a step", () => {
    expect(treeWordsAt(tree, 1)).toHaveLength(9);
  });

  it("falls back to the same step's words once the picks leave the tree", () => {
    expect(nextWords(tree, ["I", "hug"])).toEqual(["goats", "owls", "lamps"]);
    const words = nextWords(tree, ["I", "dance"]);
    expect(words).toHaveLength(3);
    for (const word of words) expect(treeWordsAt(tree, 1)).toContain(word);
  });
});
