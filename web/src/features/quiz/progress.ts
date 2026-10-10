import type { Question, SubmitAnswersRequest } from "../../api/schemas.ts";

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

/** "A", "B", "C"… for answer badges. */
const answerKey = (index: number) => String.fromCharCode(65 + index);

/** "music-and-movies" -> "music and movies". */
const themeLabel = (theme: string) => theme.replaceAll("-", " ");

export { answerKey, currentQuestionIndex, themeLabel, toAnswerList };
export type { AnswerMap };
