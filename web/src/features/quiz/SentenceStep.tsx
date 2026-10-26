import { useMemo, useState, type MouseEvent } from "react";
import type { SentenceQuestion } from "../../api/schemas.ts";
import { useSentenceTree } from "../../api/sentenceTree.ts";
import { copy } from "../../content/index.ts";
import { isLongSentence, nextWords } from "../../domain/sentence.ts";
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
  question: SentenceQuestion;
  /** Words picked so far, starter excluded. */
  picks: readonly string[];
  timeUp: boolean;
  onPick: (word: string) => void;
  onSkip: () => void;
};

/**
 * The "I ..." sentence builder: tap one of three words, `picks` times. The
 * words come from the whole sentence tree, loaded once at startup, so the
 * next row is there the moment a word is tapped. Only the first row can wait,
 * briefly, for a tree still loading.
 */
function SentenceStep({ question, picks, timeUp, onPick, onSkip }: SentenceStepProps) {
  const tree = useSentenceTree();
  const sentence = [question.starter, ...picks];
  const sentenceKey = sentence.join(" ");
  // Off-tree picks get random words, so pin them to the sentence: words never reshuffle on screen.
  // `sentence` is rebuilt every render; `sentenceKey` tracks its content.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => tree && nextWords(tree, sentence), [tree, sentenceKey]);
  const left = question.picks - picks.length;
  const [flyFrom, setFlyFrom] = useState<DOMRect | null>(null);

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
