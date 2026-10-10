import { describe, expect, it } from "vitest";
import { SessionSchema } from "./session.ts";

describe("SessionSchema", () => {
  it("reads a session saved before the sentence question existed", () => {
    const old = { attendeeId: "a1", name: "Ana", answers: { q1: "a" }, submitted: false };
    expect(SessionSchema.parse(old)).toMatchObject({ sentence: [], sentenceSkipped: false });
  });

  it("keeps the picked words", () => {
    const saved = { answers: {}, submitted: false, sentence: ["secretly"], sentenceSkipped: false };
    expect(SessionSchema.parse(saved).sentence).toEqual(["secretly"]);
  });
});
