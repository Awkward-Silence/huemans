import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { eventQuery } from "../../api/queries.ts";
import { config } from "../../config.ts";
import { copy } from "../../content/index.ts";
import { ColorBlades, Eyebrow, Rise, Screen, Stack, Text } from "../../ui/index.ts";
import styles from "./IntroScreen.module.css";
import { STEP_ROUTES, useGoToStep } from "./steps.ts";

/** Step 1: the colours arrive. Moves on by itself, or on a tap. */
function IntroScreen({ eventId }: { eventId: string }) {
  const { data: event } = useSuspenseQuery(eventQuery(eventId));
  const goTo = useGoToStep(eventId);

  useEffect(() => {
    const id = window.setTimeout(() => goTo("name", { replace: true }), config.introAutoAdvanceMs);
    return () => window.clearTimeout(id);
  }, [goTo]);

  return (
    <Screen backdrop={<ColorBlades />} justify="end">
      <Stack gap="lg">
        <h1 className={styles.wordmark}>{copy.app.name}</h1>
        <Rise after="1.9s">
          <Text scale="lead" measure={16}>
            {copy.intro.tagline}
          </Text>
        </Rise>
        <Rise after="2.1s">
          <Eyebrow>{copy.intro.countdown(event.quizDurationSeconds)}</Eyebrow>
        </Rise>
      </Stack>
      {/* The whole screen is the tap target. */}
      <Link
        to={STEP_ROUTES.name}
        params={{ eventId }}
        replace
        className={styles.tapAnywhere}
        aria-label={copy.intro.start}
      />
    </Screen>
  );
}

export { IntroScreen };
