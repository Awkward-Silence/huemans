import { describe, expect, it } from "vitest";
import { distribute, leanFromTraits, pickGroup } from "./grouping.ts";

describe("leanFromTraits", () => {
  it("returns the top two groups as shares of those two", () => {
    expect(leanFromTraits(["analytical", "curious", "chaotic", "organized"])).toEqual([
      { color: "teal", percent: 75 },
      { color: "violet", percent: 25 },
    ]);
  });

  it("is empty when no trait maps to a group", () => {
    expect(leanFromTraits(["unknown"])).toEqual([]);
  });
});

describe("distribute", () => {
  it("always adds up to the total", () => {
    for (const total of [0, 1, 7, 47, 100]) {
      const counts = distribute(total, { amber: 9, coral: 14, teal: 12, violet: 13 });
      expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(total);
    }
  });
});

describe("pickGroup", () => {
  const lean = [
    { color: "teal" as const, percent: 52 },
    { color: "violet" as const, percent: 48 },
  ];

  it("follows the strongest lean when groups are balanced", () => {
    expect(pickGroup(lean, { amber: 9, coral: 9, teal: 10, violet: 9 })).toEqual({
      color: "teal",
      balanced: false,
    });
  });

  it("sends the tie to the smaller group when the favourite is too full", () => {
    expect(pickGroup(lean, { amber: 9, coral: 9, teal: 15, violet: 9 })).toEqual({
      color: "violet",
      balanced: true,
    });
  });

  it("falls back to the smallest group without a lean", () => {
    expect(pickGroup([], { amber: 9, coral: 3, teal: 10, violet: 9 }).color).toBe("coral");
  });
});
