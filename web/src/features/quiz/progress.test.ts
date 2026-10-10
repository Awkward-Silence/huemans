import { describe, expect, it } from "vitest";
import type { Question } from "../../api/schemas.ts";
import {
  answeredCount,
  answerKey,
  currentQuestionIndex,
  isQuizComplete,
  sentenceStatus,
  themeLabel,
  toAnswerList,
} from "./progress.ts";

const question = (id: string): Question => ({
  id,
  theme: "food",
  text: `Question ${id}`,
  answers: ["a", "b", "c", "d"].map((key) => ({ id: `${id}-${key}`, text: key })),
});
const questions = [question("q1"), question("q2"), question("q3")];

describe("currentQuestionIndex", () => {
  it("is the first unanswered question", () => {
    expect(currentQuestionIndex(questions, {})).toBe(0);
    expect(currentQuestionIndex(questions, { q1: "q1-a" })).toBe(1);
  });

  it("equals the question count when everything is answered", () => {
    expect(currentQuestionIndex(questions, { q1: "x", q2: "x", q3: "x" })).toBe(3);
  });
});

describe("toAnswerList", () => {
  it("lists answers in question order, skipping unanswered ones", () => {
    expect(toAnswerList(questions, { q3: "q3-b", q1: "q1-d" })).toEqual([
      { questionId: "q1", answerId: "q1-d" },
      { questionId: "q3", answerId: "q3-b" },
    ]);
  });
});

describe("answeredCount", () => {
  it("counts answered questions, ignoring stale ids", () => {
    expect(answeredCount(questions, {}, "building")).toBe(0);
    expect(answeredCount(questions, { q1: "x", gone: "x" }, "building")).toBe(1);
  });

  it("counts the sentence once it is settled", () => {
    const all = { q1: "x", q2: "x", q3: "x" };
    expect(answeredCount(questions, all, "building")).toBe(3);
    expect(answeredCount(questions, all, "done")).toBe(4);
    expect(answeredCount(questions, all, "skipped")).toBe(4);
    expect(answeredCount(questions, all, "none")).toBe(3);
  });
});

describe("labels", () => {
  it("formats keys and themes", () => {
    expect([0, 1, 2, 3].map(answerKey)).toEqual(["A", "B", "C", "D"]);
    expect(themeLabel("music-and-movies")).toBe("music and movies");
  });
});

describe("sentenceStatus", () => {
  const sentence = { id: "sentence-i", starter: "I", picks: 5 };

  it("is none when the quiz has no sentence question", () => {
    expect(sentenceStatus(undefined, [], false)).toBe("none");
  });

  it("follows the picks and the skip", () => {
    expect(sentenceStatus(sentence, [], false)).toBe("building");
    expect(sentenceStatus(sentence, ["secretly", "lick"], false)).toBe("building");
    expect(sentenceStatus(sentence, ["secretly", "lick"], true)).toBe("skipped");
    expect(sentenceStatus(sentence, ["loudly", "sing to", "every", "sleepy", "goat"], false)).toBe(
      "done",
    );
  });
});

describe("isQuizComplete", () => {
  it("waits for the multiple choice and for the sentence to be done or skipped", () => {
    expect(isQuizComplete(false, "done")).toBe(false);
    expect(isQuizComplete(true, "building")).toBe(false);
    expect(isQuizComplete(true, "done")).toBe(true);
    expect(isQuizComplete(true, "skipped")).toBe(true);
    expect(isQuizComplete(true, "none")).toBe(true);
  });
});
