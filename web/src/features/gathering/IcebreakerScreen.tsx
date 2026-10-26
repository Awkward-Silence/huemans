import { useIcebreaker } from "../../api/queries.ts";
import type { AssignedGroup } from "../../api/schemas.ts";
import { ErrorScreen, PendingScreen } from "../../app/StatusScreens.tsx";
import { copy } from "../../content/index.ts";
import { capitalize, formatClock } from "../../lib/format.ts";
import { enterFullscreen } from "../../lib/fullscreen.ts";
import { useCountdown } from "../../lib/useCountdown.ts";
import {
  ButtonLink,
  Countdown,
  Eyebrow,
  Heading,
  Icon,
  InfoCard,
  MessageScreen,
  PulseDot,
  Screen,
  Stack,
  Text,
  type ButtonVariant,
} from "../../ui/index.ts";
import { AssignedGroupGate } from "../grouping/AssignedGroupGate.tsx";
import { STEP_ROUTES } from "../join/steps.ts";

/** Step 7: the one question everyone asks tonight, and where the group meets. */
function IcebreakerScreen({ eventId }: { eventId: string }) {
  return (
    <AssignedGroupGate eventId={eventId}>
      {(group, attendeeId) => (
        <Icebreaker eventId={eventId} attendeeId={attendeeId} group={group} />
      )}
    </AssignedGroupGate>
  );
}

function Icebreaker({
  eventId,
  attendeeId,
  group,
}: {
  eventId: string;
  attendeeId: string;
  group: AssignedGroup;
}) {
  const icebreaker = useIcebreaker(eventId, attendeeId);
  const ready = icebreaker.data?.status === "ready" ? icebreaker.data : undefined;
  const gather = useCountdown(ready ? Date.parse(ready.gatherEndsAt) : undefined);

  if (icebreaker.isError) return <ErrorScreen reset={() => void icebreaker.refetch()} />;
  if (!icebreaker.data) return <PendingScreen />;
  if (!ready) return <Locked eventId={eventId} />;

  const colorName = capitalize(copy.groups[group.color]);
  return (
    <Screen group={group.color}>
      <Stack gap="lg">
        <Text scale="subtitle" tone="groupText">
          {copy.icebreaker.you(colorName, group.nickname)}
        </Text>
        <Stack direction="row" gap="xs" align="center">
          <PulseDot />
          <Eyebrow>{copy.icebreaker.eyebrow}</Eyebrow>
        </Stack>

        <InfoCard tone="group">
          <Icon name="quote" size={30} strokeWidth={2} />
          <Heading scale="question" tone="groupInk">
            {ready.question}
          </Heading>
        </InfoCard>

        <Stack gap="xs">
          <Eyebrow as="h2">{copy.icebreaker.whyTitle}</Eyebrow>
          <Text>{ready.why}</Text>
        </Stack>

        <InfoCard>
          <Stack direction="row" justify="between" align="baseline" gap="sm">
            <Text scale="cta">{copy.icebreaker.meet(colorName, ready.meetingSpot)}</Text>
            <Countdown
              seconds={gather.secondsLeft}
              format="clock"
              tone="groupText"
              srLabel={(seconds) => copy.icebreaker.gatherLabel(formatClock(seconds))}
              announceEvery={30}
            />
          </Stack>
          <Text scale="small" tone="muted">
            {copy.icebreaker.heading(group.mates, copy.groups[group.color])}
          </Text>
        </InfoCard>
      </Stack>

      <Stack gap="md" pushEnd>
        <ButtonLink
          to={STEP_ROUTES.badge}
          params={{ eventId }}
          variant="group"
          icon="arrowRight"
          onClick={enterFullscreen}
        >
          {copy.icebreaker.cta}
        </ButtonLink>
        <Text scale="caption" tone="muted" align="center">
          {copy.icebreaker.hint}
        </Text>
        <BackToColour eventId={eventId} variant="ghost" />
      </Stack>
    </Screen>
  );
}

/** Waits here: the icebreaker query keeps polling and swaps this out once it unlocks. */
function Locked({ eventId }: { eventId: string }) {
  return (
    <MessageScreen
      title={copy.icebreaker.lockedTitle}
      body={copy.icebreaker.lockedBody}
      busy
      action={<BackToColour eventId={eventId} />}
    />
  );
}

function BackToColour({ eventId, variant }: { eventId: string; variant?: ButtonVariant }) {
  return (
    <ButtonLink to={STEP_ROUTES.reveal} params={{ eventId }} variant={variant}>
      {copy.icebreaker.back}
    </ButtonLink>
  );
}

export { IcebreakerScreen };
