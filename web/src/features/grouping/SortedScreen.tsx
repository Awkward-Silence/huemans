import { useAssignment } from "../../api/queries.ts";
import { copy } from "../../content/index.ts";
import {
  Button,
  ButtonLink,
  ColorOrbs,
  Eyebrow,
  Heading,
  Screen,
  Stack,
  Text,
} from "../../ui/index.ts";
import { useJoinedSession } from "../join/session.ts";
import { STEP_ROUTES } from "../join/steps.ts";

/** Step 4: suspense. The colours are still mixed until the attendee taps reveal. */
function SortedScreen({ eventId }: { eventId: string }) {
  const session = useJoinedSession(eventId);
  const assignment = useAssignment(eventId, session.attendeeId);
  const assigned = assignment.data?.status === "assigned" ? assignment.data : undefined;

  const answerCount = Object.keys(session.answers).length;
  const seconds = Math.round(((session.quizFinishedAt ?? 0) - (session.quizStartedAt ?? 0)) / 1000);
  const [greeting, sorted] = copy.sorted.title(session.name);

  return (
    <Screen backdrop={<ColorOrbs />} align="center">
      <Stack gap="sm" align="center">
        <Eyebrow align="center">{copy.sorted.stats(answerCount, Math.max(0, seconds))}</Eyebrow>
        <Heading scale="headline" align="center">
          {greeting}
          <br />
          {sorted}
        </Heading>
      </Stack>

      <Stack gap="lg" align="stretch" pushEnd>
        <Text scale="bodyL" align="center" measure={24} aria-live="polite">
          {assigned ? copy.sorted.body(assigned.mates) : copy.sorted.pending}
        </Text>
        {assigned ? (
          <ButtonLink to={STEP_ROUTES.reveal} params={{ eventId }} nudge>
            {copy.sorted.cta}
          </ButtonLink>
        ) : (
          <Button loading>{copy.sorted.cta}</Button>
        )}
        <Text scale="caption" tone="muted" align="center">
          {copy.sorted.hint}
        </Text>
      </Stack>
    </Screen>
  );
}

export { SortedScreen };
