import { useSuspenseQuery } from "@tanstack/react-query";
import { eventQuery, quizQuery } from "../../api/queries.ts";
import { copy } from "../../content/index.ts";
import {
  Button,
  Eyebrow,
  Heading,
  PulseDot,
  Rise,
  Screen,
  SegmentedProgress,
  Stack,
  Text,
} from "../../ui/index.ts";
import { answeredCount, sentenceStatus } from "../quiz/progress.ts";
import { useJoinedSession } from "./session.ts";
import { markPresent, useGoToStep } from "./steps.ts";
import styles from "./WelcomeBackScreen.module.css";

/**
 * Shown instead of the quiz when an attendee reopens the link (or reloads)
 * mid-quiz: the phone kept their place, one tap resumes it. No group colour
 * here; nobody is sorted yet.
 */
function WelcomeBackScreen({ eventId }: { eventId: string }) {
  const { data: event } = useSuspenseQuery(eventQuery(eventId));
  const { data: quiz } = useSuspenseQuery(quizQuery(eventId));
  const session = useJoinedSession(eventId);
  const goTo = useGoToStep(eventId);

  const sentence = sentenceStatus(quiz.sentence, session.sentence, session.sentenceSkipped);
  const answered = answeredCount(quiz.questions, session.answers, sentence);
  const total = quiz.questions.length + (quiz.sentence ? 1 : 0);
  const [greeting, name] = copy.welcome.title(session.name);

  const resume = () => {
    markPresent(eventId);
    void goTo("quiz", { replace: true });
  };

  return (
    <Screen>
      <Stack direction="row" justify="between" align="center" gap="sm">
        <Eyebrow as="span" className={styles.event}>
          {copy.welcome.event(copy.app.name, event.name)}
        </Eyebrow>
        <Stack direction="row" gap="xs" align="center" className={styles.live}>
          <PulseDot tone="accent" />
          <Eyebrow as="span">{copy.welcome.live}</Eyebrow>
        </Stack>
      </Stack>

      <Rise className={styles.title}>
        <Heading scale="headline">
          {greeting}
          <br />
          {name}
        </Heading>
      </Rise>

      <Rise step={1} className={styles.blockWrap}>
        <Stack gap="xl" align="center" justify="center" className={styles.block}>
          <Text scale="lead" tone="inherit" align="center" measure={20} className={styles.body}>
            {copy.welcome.body}
          </Text>
          <SegmentedProgress
            total={total}
            current={answered}
            palette="ink"
            size="lg"
            label={copy.welcome.progressLabel(answered, total)}
          />
          <Button variant="page" size="xl" icon="arrowRight" nudge onClick={resume}>
            {copy.welcome.cta}
          </Button>
        </Stack>
      </Rise>

      <Text scale="caption" tone="muted" className={styles.footnote}>
        {copy.welcome.footnote}
      </Text>
    </Screen>
  );
}

export { WelcomeBackScreen };
