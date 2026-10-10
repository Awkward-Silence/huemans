import { useIcebreaker } from "../../api/queries.ts";
import type { AssignedGroup } from "../../api/schemas.ts";
import { copy } from "../../content/index.ts";
import { exitFullscreen } from "../../lib/fullscreen.ts";
import { useWakeLock } from "../../lib/useWakeLock.ts";
import {
  Button,
  Eyebrow,
  FitText,
  Heading,
  Icon,
  Marquee,
  Screen,
  Stack,
  Text,
} from "../../ui/index.ts";
import { AssignedGroupGate } from "../grouping/AssignedGroupGate.tsx";
import { useJoinedSession } from "../join/session.ts";
import { useGoToStep } from "../join/steps.ts";
import styles from "./BadgeScreen.module.css";

/** Step 8: the phone becomes a glowing name badge. Turned sideways, it scrolls like an LED sign. */
function BadgeScreen({ eventId }: { eventId: string }) {
  return (
    <AssignedGroupGate eventId={eventId}>
      {(group, attendeeId) => <Badge eventId={eventId} attendeeId={attendeeId} group={group} />}
    </AssignedGroupGate>
  );
}

function Badge({
  eventId,
  attendeeId,
  group,
}: {
  eventId: string;
  attendeeId: string;
  group: AssignedGroup;
}) {
  const { name } = useJoinedSession(eventId);
  const icebreaker = useIcebreaker(eventId, attendeeId);
  const question = icebreaker.data?.status === "ready" ? icebreaker.data.question : undefined;
  const goTo = useGoToStep(eventId);
  useWakeLock();

  const leave = () => {
    exitFullscreen();
    void goTo("icebreaker", { replace: true });
  };
  const [ask, anything] = copy.badge.callout;

  return (
    <Screen tone="group" group={group.color} padding="compact" fullBleed>
      <Stack direction="row" justify="between" align="center">
        <Eyebrow tone="groupInkSoft">
          {copy.badge.group(copy.groups[group.color], group.nickname)}
        </Eyebrow>
        <Button
          variant="ghost"
          size="md"
          block={false}
          onClick={leave}
          aria-label={copy.badge.exitLabel}
        >
          {copy.badge.exit}
        </Button>
      </Stack>

      <div className={styles.portrait}>
        <Stack gap="lg" grow justify="center">
          <FitText as="h1" text={name} scale="badge" />
          <div className={styles.rule} aria-hidden="true" />
          <Heading level={2} scale="title" tone="groupInk" uppercase>
            {ask}
            <br />
            {anything}
          </Heading>
        </Stack>

        <Stack gap="md">
          {question && (
            <Text scale="body" tone="groupInkSoft" className={styles.question}>
              “{question}”
            </Text>
          )}
          <Stack direction="row" gap="sm" align="center">
            <Icon name="rotatePhone" size={26} strokeWidth={1.8} />
            <Eyebrow tone="groupInkSoft" className={styles.blink}>
              {copy.badge.rotateHint}
            </Eyebrow>
          </Stack>
        </Stack>
      </div>

      <div className={styles.landscape} aria-hidden="true">
        <Marquee duration={14}>
          <span className={styles.ticker}>
            {name} · {ask} {anything}
            {question ? ` · ${question}` : ""}
          </span>
        </Marquee>
      </div>
    </Screen>
  );
}

export { BadgeScreen };
