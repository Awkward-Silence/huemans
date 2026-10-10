import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type MouseEvent } from "react";
import { wordSuggestionsQuery } from "../../api/queries.ts";
import type { SentenceQuestion } from "../../api/schemas.ts";
import { copy } from "../../content/index.ts";
import { isLongSentence } from "../../domain/sentence.ts";
import {
  Button,
  GrowingSentence,
  Heading,
  ProgressDots,
  Stack,
  Text,
  WordChoice,
  WordChoiceSkeleton,
} from "../../ui/index.ts";
import styles from "./SentenceStep.module.css";

const SKELETON_WIDTHS = [30, 40, 26];

type SentenceStepProps = {
  eventId: string;
  attendeeId: string;
  question: SentenceQuestion;
  /** Words picked so far, starter excluded. */
  picks: readonly string[];
  timeUp: boolean;
  onPick: (word: string) => void;
  onSkip: () => void;
};

/**
 * The "I ..." sentence builder: tap one of three suggested words, `picks`
 * times. The follow-up words of every word on screen are prefetched, so the
 * next row is usually there the moment a word is tapped.
 */
function SentenceStep({
  eventId,
  attendeeId,
  question,
  picks,
  timeUp,
  onPick,
  onSkip,
}: SentenceStepProps) {
  const queryClient = useQueryClient();
  const sentence = [question.starter, ...picks];
  const sentenceKey = sentence.join(" ");
  const suggestions = useQuery(wordSuggestionsQuery(eventId, question, attendeeId, sentence));
  const words = suggestions.data?.words;
  const left = question.picks - picks.length;
  const [flyFrom, setFlyFrom] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!words || left <= 1) return;
    for (const word of words) {
      void queryClient.prefetchQuery(
        wordSuggestionsQuery(eventId, question, attendeeId, [...sentence, word]),
      );
    }
    // `sentence` is rebuilt every render; `sentenceKey` tracks its content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, left, sentenceKey, eventId, question, attendeeId, queryClient]);

  const pick = (word: string, event: MouseEvent<HTMLButtonElement>) => {
    const label = event.currentTarget.firstElementChild ?? event.currentTarget;
    setFlyFrom(label.getBoundingClientRect());
    onPick(word);
  };

  const footer = timeUp
    ? copy.sentence.footerTimeUp
    : words
      ? copy.sentence.footer(left, question.picks)
      : copy.sentence.footerLoading;

  return (
    <>
      <Stack gap="xs" className={styles.intro}>
        <Heading scale="subtitle">{copy.sentence.title}</Heading>
        <Text scale="small" tone="muted" className={words ? undefined : styles.thinking}>
          {words
            ? timeUp
              ? copy.sentence.timeUpHint(left)
              : copy.sentence.hint
            : copy.sentence.thinking}
        </Text>
      </Stack>

      <div className={styles.sentence}>
        <GrowingSentence
          words={sentence}
          compact={isLongSentence(sentence)}
          caret
          flyFrom={flyFrom}
        />
      </div>

      <Stack direction="row" gap="sm" align="center">
        <ProgressDots total={question.picks} filled={picks.length} />
        <Text as="span" scale="caption" tone="muted" uppercase className={styles.count}>
          {copy.sentence.progress(picks.length, question.picks)}
        </Text>
      </Stack>

      <Stack gap="sm" className={styles.choices}>
        {words ? (
          words.map((word, index) => (
            <WordChoice
              key={`${sentenceKey} ${word}`}
              word={word}
              step={index}
              onClick={(event) => pick(word, event)}
            />
          ))
        ) : (
          <>
            {SKELETON_WIDTHS.map((width, index) => (
              <WordChoiceSkeleton key={index} step={index} width={width} />
            ))}
            <Text scale="caption" tone="muted" align="center" role="status">
              {copy.sentence.loadingStatus}
            </Text>
          </>
        )}
      </Stack>

      <Stack gap="xs" align="center" pushEnd className={styles.footer}>
        <Button variant="ghost" size="md" block={false} className={styles.skip} onClick={onSkip}>
          {copy.sentence.skip}
        </Button>
        <Text scale="caption" tone="muted" align="center">
          {footer}
        </Text>
      </Stack>
    </>
  );
}

export { SentenceStep };
