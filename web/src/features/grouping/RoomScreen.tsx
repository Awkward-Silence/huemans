import { useIcebreaker, useRoom } from "../../api/queries.ts";
import type { AssignedGroup, Room } from "../../api/schemas.ts";
import { copy } from "../../content/index.ts";
import { capitalize } from "../../lib/format.ts";
import {
  Button,
  ButtonLink,
  GroupBars,
  Heading,
  InfoCard,
  ProgressBar,
  Screen,
  Stack,
  Text,
} from "../../ui/index.ts";
import { STEP_ROUTES } from "../join/steps.ts";
import { AssignedGroupGate } from "./AssignedGroupGate.tsx";
import { GroupWord } from "./GroupWord.tsx";
import styles from "./RoomScreen.module.css";

/** Step 6: the live room, and why the attendee got their colour. */
function RoomScreen({ eventId }: { eventId: string }) {
  return (
    <AssignedGroupGate eventId={eventId}>
      {(group, attendeeId) => <Room eventId={eventId} attendeeId={attendeeId} group={group} />}
    </AssignedGroupGate>
  );
}

function Room({
  eventId,
  attendeeId,
  group,
}: {
  eventId: string;
  attendeeId: string;
  group: AssignedGroup;
}) {
  const room = useRoom(eventId);
  const icebreaker = useIcebreaker(eventId, attendeeId);
  const unlocked = icebreaker.data?.status === "ready";

  return (
    <Screen group={group.color}>
      <Stack gap="xl">
        {room.data ? (
          <RoomStats room={room.data} you={group} />
        ) : (
          <Heading>{copy.room.title}</Heading>
        )}
        <WhyCard group={group} />
      </Stack>

      <Stack gap="md" pushEnd className={styles.footer}>
        {unlocked ? (
          <ButtonLink to={STEP_ROUTES.icebreaker} params={{ eventId }}>
            {copy.room.cta}
          </ButtonLink>
        ) : (
          <Button disabled>{copy.room.cta}</Button>
        )}
        <Text scale="caption" tone="muted" align="center" aria-live="polite">
          {unlocked ? copy.room.ready : copy.room.locked}
        </Text>
      </Stack>
    </Screen>
  );
}

function RoomStats({ room, you }: { room: Room; you: AssignedGroup }) {
  const stillTyping = room.total - room.answered;
  const bars = room.groups.map(({ color, count }) => ({
    color,
    count,
    label: capitalize(copy.groups[color]),
    isYou: color === you.color,
  }));
  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <Heading>{copy.room.title}</Heading>
        <Stack direction="row" gap="xs" align="baseline" wrap>
          <Text as="span" tabular>
            {copy.room.answered(room.answered, room.total)}
          </Text>
          <Text as="span" scale="small" tone="muted">
            {stillTyping > 0 ? copy.room.typing(stillTyping) : copy.room.allIn}
          </Text>
        </Stack>
        <ProgressBar
          value={room.total ? room.answered / room.total : 0}
          tone="text"
          label={copy.room.answered(room.answered, room.total)}
        />
      </Stack>
      <GroupBars
        groups={bars}
        youLabel={copy.room.you}
        label={bars.map((bar) => `${bar.label} ${bar.count}`).join(", ")}
      />
    </Stack>
  );
}

function WhyCard({ group }: { group: AssignedGroup }) {
  const [mine, runnerUp] = group.reason.lean;
  const runnerUpName = runnerUp ? copy.groups[runnerUp.color] : undefined;
  const otherOption = group.reason.lean.find((lean) => lean.color !== group.color);
  const title = copy.room.whyTitle(
    copy.groups[group.color],
    otherOption && copy.groups[otherOption.color],
  );
  return (
    <InfoCard title={title}>
      <Text>
        {mine && (
          <>
            {copy.room.lean}{" "}
            <GroupWord
              color={mine.color}
            >{`${mine.percent}% ${copy.groups[mine.color]}`}</GroupWord>
            {runnerUp && (
              <>
                {` ${copy.room.and} `}
                <GroupWord
                  color={runnerUp.color}
                >{`${runnerUp.percent}% ${runnerUpName}`}</GroupWord>
              </>
            )}
            {". "}
          </>
        )}
        {group.reason.text}
      </Text>
      <Text scale="small" tone="muted">
        {copy.room.fairness}
      </Text>
    </InfoCard>
  );
}

export { RoomScreen };
