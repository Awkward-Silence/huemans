import type { Question, SentenceQuestion, SubmitAnswersRequest } from "../../api/schemas.ts";

type AnswerMap = Record<string, string>;

/** Index of the first unanswered question; equals `questions.length` when all are done. */
function currentQuestionIndex(questions: Question[], answers: AnswerMap): number {
  const index = questions.findIndex((question) => !(question.id in answers));
  return index === -1 ? questions.length : index;
}

/** The answers in question order, ready to submit. */
function toAnswerList(questions: Question[], answers: AnswerMap): SubmitAnswersRequest["answers"] {
  return questions.flatMap((question) => {
    const answerId = answers[question.id];
    return answerId ? [{ questionId: question.id, answerId }] : [];
  });
}

/**
 * Where the sentence question stands. "none" when the quiz has no sentence
 * question (an older api/), so the quiz ends after the multiple choice.
 */
type SentenceStatus = "none" | "building" | "done" | "skipped";

function sentenceStatus(
  question: SentenceQuestion | undefined,
  picks: readonly string[],
  skipped: boolean,
): SentenceStatus {
  if (!question) return "none";
  if (picks.length >= question.picks) return "done";
  return skipped ? "skipped" : "building";
}

/** The quiz can be submitted once the multiple choice and the sentence are settled. */
const isQuizComplete = (allAnswered: boolean, sentence: SentenceStatus) =>
  allAnswered && sentence !== "building";

/** How many quiz steps are settled, the sentence counting once it is done or skipped. */
function answeredCount(
  questions: Question[],
  answers: AnswerMap,
  sentence: SentenceStatus,
): number {
  const answered = questions.filter((question) => question.id in answers).length;
  return answered + (sentence === "done" || sentence === "skipped" ? 1 : 0);
}

/** "A", "B", "C"… for answer badges. */
const answerKey = (index: number) => String.fromCharCode(65 + index);

/** "music-and-movies" -> "music and movies". */
const themeLabel = (theme: string) => theme.replaceAll("-", " ");

export {
  answeredCount,
  answerKey,
  currentQuestionIndex,
  isQuizComplete,
  sentenceStatus,
  themeLabel,
  toAnswerList,
};
export type { AnswerMap, SentenceStatus };
