import { describe, expect, it } from "vitest";
import type { Session } from "./session.ts";
import { redirectFor, stageOf } from "./steps.ts";

const fresh: Session = { answers: {}, sentence: [], sentenceSkipped: false, submitted: false };
const joined: Session = { ...fresh, attendeeId: "a1", name: "Ana" };
const submitted: Session = { ...joined, answers: { q1: "a" }, submitted: true };

describe("stageOf", () => {
  it("follows the session", () => {
    expect(stageOf(fresh)).toBe("joining");
    expect(stageOf(joined)).toBe("quizzing");
    expect(stageOf(submitted)).toBe("sorted");
  });

  it("calls a joined attendee returning until this page load has seen them", () => {
    expect(stageOf(joined, false)).toBe("returning");
    expect(stageOf(fresh, false)).toBe("joining");
    expect(stageOf(submitted, false)).toBe("sorted");
  });
});

describe("redirectFor", () => {
  it("keeps newcomers on the intro and name steps", () => {
    expect(redirectFor("intro", fresh)).toBeNull();
    expect(redirectFor("name", fresh)).toBeNull();
    expect(redirectFor("quiz", fresh)).toBe("intro");
    expect(redirectFor("badge", fresh)).toBe("intro");
  });

  it("sends a joined attendee back to the quiz until they submit", () => {
    expect(redirectFor("quiz", joined)).toBeNull();
    expect(redirectFor("name", joined)).toBe("quiz");
    expect(redirectFor("reveal", joined)).toBe("quiz");
  });

  it("welcomes a returning attendee back before the quiz", () => {
    expect(redirectFor("quiz", joined, false)).toBe("welcome");
    expect(redirectFor("intro", joined, false)).toBe("welcome");
    expect(redirectFor("welcome", joined, false)).toBeNull();
  });

  it("skips the welcome once the attendee is back in the quiz", () => {
    expect(redirectFor("welcome", joined)).toBe("quiz");
    expect(redirectFor("welcome", fresh)).toBe("intro");
    expect(redirectFor("welcome", submitted)).toBe("sorted");
  });

  it("never lets a sorted attendee retake the quiz", () => {
    expect(redirectFor("quiz", submitted)).toBe("sorted");
    expect(redirectFor("intro", submitted)).toBe("sorted");
    for (const step of ["sorted", "reveal", "icebreaker", "badge"] as const) {
      expect(redirectFor(step, submitted)).toBeNull();
    }
  });
});
