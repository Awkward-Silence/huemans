import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useEffectEvent, useRef } from "react";
import { quizQuery, useSubmitAnswers } from "../../api/queries.ts";
import { copy } from "../../content/index.ts";
import { useCountdown } from "../../lib/useCountdown.ts";
import {
  AnswerOption,
  Button,
  Chip,
  Countdown,
  Heading,
  ProgressBar,
  Rise,
  Screen,
  SegmentedProgress,
  Stack,
  Text,
  VisuallyHidden,
} from "../../ui/index.ts";
import { updateSession, useJoinedSession } from "../join/session.ts";
import { useGoToStep } from "../join/steps.ts";
import { answerKey, currentQuestionIndex, themeLabel, toAnswerList } from "./progress.ts";
import styles from "./QuizScreen.module.css";

/**
 * Step 3: one question per screen against a soft deadline. When time runs
 * out nothing closes; the timer is a nudge, not a gate. The last answer
 * submits by itself (also after a refresh), then the attendee is "sorted".
 */
function QuizScreen({ eventId }: { eventId: string }) {
  const { data: quiz } = useSuspenseQuery(quizQuery(eventId));
  const session = useJoinedSession(eventId);
  const submit = useSubmitAnswers(eventId, session.attendeeId);
  const goTo = useGoToStep(eventId);

  const { questions, durationSeconds } = quiz;
  const index = currentQuestionIndex(questions, session.answers);
  const question = questions[index];
  const allAnswered = question === undefined;
  const position = Math.min(index + 1, questions.length);

  const durationMs = durationSeconds * 1000;
  const endsAt = session.quizStartedAt && session.quizStartedAt + durationMs;
  const timer = useCountdown(endsAt, durationMs);

  // The clock starts the first time the quiz is on screen, and survives refreshes.
  useEffect(() => {
    if (!session.quizStartedAt) updateSession(eventId, { quizStartedAt: Date.now() });
  }, [eventId, session.quizStartedAt]);

  // Guards against double submits (StrictMode re-runs effects; fast double taps).
  const inFlight = useRef(false);
  const send = () => {
    if (inFlight.current) return;
    inFlight.current = true;
    const finishedAt = session.quizFinishedAt ?? Date.now();
    submit.mutate(
      {
        answers: toAnswerList(questions, session.answers),
        elapsedMs: Math.max(0, finishedAt - (session.quizStartedAt ?? finishedAt)),
      },
      {
        onSuccess: () => {
          updateSession(eventId, { submitted: true });
          void goTo("sorted", { replace: true });
        },
        onError: () => {
          inFlight.current = false;
        },
      },
    );
  };

  const sendWhenDone = useEffectEvent(() => {
    if (allAnswered && submit.isIdle) send();
  });
  useEffect(() => sendWhenDone(), [allAnswered]);

  const answer = (questionId: string, answerId: string) => {
    const isLast = index === questions.length - 1;
    updateSession(eventId, (current) => ({
      ...current,
      answers: { ...current.answers, [questionId]: answerId },
      quizFinishedAt: isLast ? Date.now() : current.quizFinishedAt,
    }));
  };

  return (
    <Screen padding="compact" className={styles.quiz}>
      <ProgressBar value={timer.fractionLeft} shape="flush" className={styles.timeBar} />

      <Stack direction="row" justify="between" align="center">
        <Stack direction="row" gap="sm" align="center">
          <Text as="span" scale="cta" tabular aria-hidden="true">
            {position}
            <Text as="span" scale="cta" tone="muted">
              /{questions.length}
            </Text>
          </Text>
          <VisuallyHidden>{copy.quiz.positionLabel(position, questions.length)}</VisuallyHidden>
          {question && <Chip tone="accent">{themeLabel(question.theme)}</Chip>}
        </Stack>
        <Countdown
          seconds={timer.secondsLeft}
          unit={copy.quiz.secondsUnit}
          srLabel={copy.quiz.secondsLeftLabel}
        />
      </Stack>

      {question ? (
        <Rise key={question.id} className={styles.question}>
          <Stack gap="xl">
            <Heading scale="question">{question.text}</Heading>
            <Stack gap="sm">
              {question.answers.map((option, optionIndex) => (
                <AnswerOption
                  key={option.id}
                  keyLabel={answerKey(optionIndex)}
                  onClick={() => answer(question.id, option.id)}
                >
                  {option.text}
                </AnswerOption>
              ))}
            </Stack>
          </Stack>
        </Rise>
      ) : (
        <Stack gap="lg" grow justify="center" className={styles.question} aria-live="polite">
          <Heading scale="question">
            {submit.isError ? copy.quiz.submitFailed : copy.quiz.submitting}
          </Heading>
          {submit.isError && <Button onClick={send}>{copy.app.retry}</Button>}
        </Stack>
      )}

      <Stack gap="md" pushEnd className={styles.footer}>
        <SegmentedProgress total={questions.length} current={index} palette="groups" size="sm" />
        <Text scale="caption" tone="muted">
          {timer.isOver ? copy.quiz.timeUp : copy.quiz.nudge(durationSeconds)}
        </Text>
      </Stack>
    </Screen>
  );
}

export { QuizScreen };
