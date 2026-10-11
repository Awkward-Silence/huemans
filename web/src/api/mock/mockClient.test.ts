import { describe, expect, it } from "vitest";
import { createMockClient } from "./mockClient.ts";

/** A mock with no latency and a clock the test moves by hand. */
function setup(overrides: Partial<Parameters<typeof createMockClient>[0]> = {}) {
  let now = Date.parse("2026-10-10T20:00:00Z");
  const api = createMockClient({
    latencyMs: 0,
    sentenceTreeLatencyMs: 0,
    persist: false,
    now: () => now,
    crowdFinishMs: 10_000,
    groupingDelayMs: 1_000,
    ...overrides,
  });
  return { api, advance: (ms: number) => (now += ms) };
}

describe("mock client", () => {
  it("runs the attendee flow end to end", async () => {
    const { api, advance } = setup();
    const event = await api.getEvent("demo");
    const quiz = await api.getQuiz("demo");
    expect(quiz.questions).toHaveLength(event.questionCount);

    const { attendeeId } = await api.join("demo", { name: "Ana" });
    expect(await api.getAssignment("demo", attendeeId)).toEqual({ status: "pending" });

    await api.submitAnswers("demo", attendeeId, {
      answers: quiz.questions.map((question) => ({
        questionId: question.id,
        answerId: question.answers[0]!.id,
      })),
      elapsedMs: 12_000,
    });
    expect(await api.getIcebreaker("demo", attendeeId)).toEqual({ status: "locked" });

    advance(1_000);
    const assignment = await api.getAssignment("demo", attendeeId);
    expect(assignment.status).toBe("assigned");

    const room = await api.getRoom("demo");
    expect(room.answered).toBeLessThan(room.total);
    expect(room.groups.reduce((sum, group) => sum + group.count, 0)).toBe(room.answered);

    advance(10_000);
    const finalRoom = await api.getRoom("demo");
    expect(finalRoom.answered).toBe(finalRoom.total);
    const icebreaker = await api.getIcebreaker("demo", attendeeId);
    expect(icebreaker.status).toBe("ready");
  });

  it("puts the attendee in a random group, whatever they answered", async () => {
    const { api, advance } = setup({ random: () => 0.99 });
    const quiz = await api.getQuiz("demo");
    const { attendeeId } = await api.join("demo", { name: "Ana" });
    await api.submitAnswers("demo", attendeeId, {
      answers: quiz.questions.map((question) => ({
        questionId: question.id,
        answerId: question.answers[0]!.id,
      })),
      elapsedMs: 12_000,
    });

    advance(1_000);
    expect(await api.getAssignment("demo", attendeeId)).toMatchObject({
      status: "assigned",
      color: "violet",
      reason: { lean: [] },
    });
  });

  it("gives every phone the same quiz for an event", async () => {
    const { api } = setup();
    const first = await api.getQuiz("demo");
    const second = await api.getQuiz("demo");
    expect(second.questions.map((q) => q.id)).toEqual(first.questions.map((q) => q.id));
  });

  it("does not send answer traits to the client", async () => {
    const { api } = setup();
    const quiz = await api.getQuiz("demo");
    expect(quiz.questions[0]!.answers[0]).not.toHaveProperty("trait");
  });

  it("announces the sentence question and serves the whole sentence tree", async () => {
    const { api } = setup();
    const { sentence } = await api.getQuiz("demo");
    expect(sentence).toEqual({ id: "sentence-i", starter: "I", picks: 5 });

    const tree = await api.getSentenceTree();
    expect(tree).toMatchObject({ starter: "I", picks: 5 });
    expect(tree.options.map((option) => option.text)).toEqual([
      "loudly",
      "suspiciously",
      "happily",
    ]);
  });

  it("rejects unknown attendees", async () => {
    const { api } = setup();
    await expect(api.getAssignment("demo", "nobody")).rejects.toMatchObject({ kind: "not-found" });
  });
});
