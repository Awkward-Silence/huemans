import { copy } from "../../content/index.ts";
import { isLongSentence } from "../../domain/sentence.ts";
import {
  Button,
  Eyebrow,
  GrowingSentence,
  Heading,
  Icon,
  Screen,
  Sparks,
  Stack,
  Text,
} from "../../ui/index.ts";
import styles from "./SentenceDone.module.css";

/** How long the finished sentence stays up before moving on, even if the submit is quicker. */
const SENTENCE_DONE_HOLD_MS = 2_200;

type SentenceDoneProps = {
  sentence: readonly string[];
  submitFailed: boolean;
  onRetry: () => void;
};

/** The finished sentence gets a moment on screen while the answers send. */
function SentenceDone({ sentence, submitFailed, onRetry }: SentenceDoneProps) {
  return (
    <Screen className={styles.done}>
      <Sparks className={styles.sparks} />

      <Eyebrow className={styles.pop}>{copy.sentence.done}</Eyebrow>

      <Stack grow justify="center" className={styles.pop} style={{ animationDelay: "0.1s" }}>
        <GrowingSentence
          words={sentence}
          compact={isLongSentence(sentence)}
          highlightFrom={Math.max(1, sentence.length - 2)}
        />
      </Stack>

      <Stack gap="lg" aria-live="polite">
        <Stack direction="row" gap="sm" align="center" className={styles.fade}>
          <span className={styles.check}>
            <Icon name="check" size={15} strokeWidth={3} />
          </span>
          <Text scale="small" tone="muted">
            {copy.sentence.doneNote}
          </Text>
        </Stack>

        {submitFailed ? (
          <Stack gap="md">
            <Heading level={2} scale="cta">
              {copy.quiz.submitFailed}
            </Heading>
            <Button onClick={onRetry}>{copy.app.retry}</Button>
          </Stack>
        ) : (
          <Stack gap="sm">
            <div className={styles.track}>
              <div className={styles.fill} />
            </div>
            <Text scale="caption" tone="muted" uppercase className={styles.sending}>
              {copy.quiz.submitting}
            </Text>
          </Stack>
        )}
      </Stack>
    </Screen>
  );
}

export { SENTENCE_DONE_HOLD_MS, SentenceDone };
