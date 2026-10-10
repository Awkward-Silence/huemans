import { describe, expect, it } from "vitest";
import type { Question } from "../../api/schemas.ts";
import { answerKey, currentQuestionIndex, themeLabel, toAnswerList } from "./progress.ts";

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

describe("labels", () => {
  it("formats keys and themes", () => {
    expect([0, 1, 2, 3].map(answerKey)).toEqual(["A", "B", "C", "D"]);
    expect(themeLabel("music-and-movies")).toBe("music and movies");
  });
});
