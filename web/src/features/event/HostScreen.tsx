import { QRCodeSVG } from "qrcode.react";
import { useEvent, useReveal, useRoom } from "../../api/queries.ts";
import { copy } from "../../content/index.ts";
import { eventCopy } from "../../content/event.ts";
import {
  Button,
  ButtonLink,
  Eyebrow,
  GroupBars,
  Heading,
  Screen,
  Stack,
  Text,
} from "../../ui/index.ts";
import { joinUrlFor } from "./createEvent.ts";
import styles from "./HostScreen.module.css";

/** The host's screen for one event: the big QR code attendees scan, the live room and the icebreaker reveal. */
function HostScreen({ eventId, infoUrl }: { eventId: string; infoUrl?: string }) {
  // The route loader has already fetched the event.
  const event = useEvent(eventId).data!;
  const reveal = useReveal(eventId);
  const room = useRoom(eventId).data;
  const revealed = event.status === "revealed";
  const joinUrl = joinUrlFor(eventId);

  return (
    <Screen align="center">
      <Stack gap="lg" align="center">
        <Stack gap="xs" align="center">
          <Eyebrow>{eventCopy.ready.eyebrow}</Eyebrow>
          <Heading scale="headline">{event.name}</Heading>
        </Stack>
        <div className={styles.qr}>
          <QRCodeSVG
            value={joinUrl}
            level="M"
            marginSize={3}
            bgColor="transparent"
            fgColor="currentColor"
            title={eventCopy.ready.qrLabel(event.name)}
            className={styles.qrCode}
          />
        </div>
        <Text scale="small" tone="muted" className={styles.url}>
          {joinUrl}
        </Text>
        {infoUrl && (
          <Text scale="small" className={styles.url}>
            {eventCopy.ready.moreInfo}:{" "}
            <a href={infoUrl} target="_blank" rel="noreferrer" className={styles.link}>
              {infoUrl}
            </a>
          </Text>
        )}
      </Stack>
      {room && (
        <Stack gap="sm" align="stretch" className={styles.room}>
          <Eyebrow align="center">{eventCopy.ready.room}</Eyebrow>
          <GroupBars
            groups={room.groups.map((group) => ({ ...group, label: copy.groups[group.color] }))}
            youLabel=""
            label={room.groups
              .map((group) => `${copy.groups[group.color]} ${group.count}`)
              .join(", ")}
          />
          <Text scale="small" tone="muted" align="center" tabular>
            {eventCopy.ready.answered(room.answered, room.total)}
          </Text>
        </Stack>
      )}
      <Stack gap="sm" pushEnd className={styles.actions}>
        {reveal.isError && (
          <Text scale="small" tone="danger" role="alert">
            {eventCopy.ready.revealFailed}
          </Text>
        )}
        <Button
          icon={revealed ? undefined : "arrowRight"}
          loading={reveal.isPending}
          disabled={revealed}
          onClick={() => reveal.mutate()}
        >
          {revealed
            ? eventCopy.ready.revealed
            : reveal.isPending
              ? eventCopy.ready.revealing
              : eventCopy.ready.reveal}
        </Button>
        <ButtonLink
          variant="ghost"
          to="/join/$eventId"
          params={{ eventId }}
          target="_blank"
          icon="arrowRight"
        >
          {eventCopy.ready.open}
        </ButtonLink>
        <ButtonLink variant="ghost" to="/event">
          {eventCopy.ready.another}
        </ButtonLink>
      </Stack>
    </Screen>
  );
}

export { HostScreen };
