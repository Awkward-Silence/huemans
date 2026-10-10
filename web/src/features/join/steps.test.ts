import { describe, expect, it } from "vitest";
import type { Session } from "./session.ts";
import { redirectFor, stageOf } from "./steps.ts";

const fresh: Session = { answers: {}, submitted: false };
const joined: Session = { ...fresh, attendeeId: "a1", name: "Ana" };
const submitted: Session = { ...joined, answers: { q1: "a" }, submitted: true };

describe("stageOf", () => {
  it("follows the session", () => {
    expect(stageOf(fresh)).toBe("joining");
    expect(stageOf(joined)).toBe("quizzing");
    expect(stageOf(submitted)).toBe("sorted");
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

  it("never lets a sorted attendee retake the quiz", () => {
    expect(redirectFor("quiz", submitted)).toBe("sorted");
    expect(redirectFor("intro", submitted)).toBe("sorted");
    for (const step of ["sorted", "reveal", "room", "icebreaker", "badge"] as const) {
      expect(redirectFor(step, submitted)).toBeNull();
    }
  });
});
