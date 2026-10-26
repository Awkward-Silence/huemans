import { useMutation } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { useState, type FormEvent } from "react";
import { useReveal } from "../../api/queries.ts";
import { eventCopy } from "../../content/event.ts";
import {
  Button,
  ButtonLink,
  Eyebrow,
  Heading,
  Screen,
  Stack,
  Text,
  TextField,
} from "../../ui/index.ts";
import {
  createEvent,
  EVENT_NAME_MAX_LENGTH,
  EventNameSchema,
  InfoUrlSchema,
  type CreatedEvent,
} from "./createEvent.ts";
import styles from "./CreateEventScreen.module.css";

/** Host page: name the event, then show the big QR code attendees scan. */
function CreateEventScreen() {
  const create = useMutation({ mutationFn: createEvent });

  if (create.data) return <EventReady event={create.data} onReset={create.reset} />;
  return <EventForm onSubmit={create.mutate} pending={create.isPending} failed={create.isError} />;
}

function EventForm({
  onSubmit,
  pending,
  failed,
}: {
  onSubmit: (input: { name: string; infoUrl?: string }) => void;
  pending: boolean;
  failed: boolean;
}) {
  const [name, setName] = useState("");
  const [infoUrl, setInfoUrl] = useState("");
  const [touched, setTouched] = useState({ name: false, infoUrl: false });

  const parsedName = EventNameSchema.safeParse(name);
  const parsedUrl = InfoUrlSchema.safeParse(infoUrl);
  const nameError =
    touched.name && !parsedName.success ? parsedName.error.issues[0]?.message : undefined;
  const urlError =
    touched.infoUrl && !parsedUrl.success ? parsedUrl.error.issues[0]?.message : undefined;

  const submit = (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    setTouched({ name: true, infoUrl: true });
    if (!parsedName.success || !parsedUrl.success) return;
    onSubmit({ name: parsedName.data, infoUrl: parsedUrl.data });
  };

  return (
    <Screen>
      <form onSubmit={submit} noValidate className={styles.form}>
        <Stack gap="3xl">
          <Stack gap="xs">
            <Eyebrow>{eventCopy.eyebrow}</Eyebrow>
            <Heading scale="headline">{eventCopy.title}</Heading>
          </Stack>
          <TextField
            label={eventCopy.name.label}
            hint={eventCopy.name.hint(EVENT_NAME_MAX_LENGTH)}
            error={nameError}
            name="eventName"
            autoComplete="off"
            autoCapitalize="words"
            enterKeyHint="next"
            placeholder={eventCopy.name.placeholder}
            maxLength={EVENT_NAME_MAX_LENGTH}
            value={name}
            onChange={(changeEvent) => setName(changeEvent.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: name.length > 0 }))}
          />
          <TextField
            className={styles.urlField}
            label={eventCopy.infoUrl.label}
            hint={eventCopy.infoUrl.hint}
            error={urlError}
            name="infoUrl"
            type="url"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder={eventCopy.infoUrl.placeholder}
            value={infoUrl}
            onChange={(changeEvent) => setInfoUrl(changeEvent.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, infoUrl: infoUrl.length > 0 }))}
          />
        </Stack>
        <Stack gap="lg" pushEnd className={styles.actions}>
          {failed && (
            <Text scale="small" tone="danger" role="alert">
              {eventCopy.createFailed}
            </Text>
          )}
          <Button type="submit" icon="arrowRight" loading={pending} disabled={!parsedName.success}>
            {eventCopy.submit}
          </Button>
        </Stack>
      </form>
    </Screen>
  );
}

function EventReady({ event, onReset }: { event: CreatedEvent; onReset: () => void }) {
  const reveal = useReveal(event.eventId);
  const revealed = reveal.data?.status === "revealed";

  return (
    <Screen align="center">
      <Stack gap="lg" align="center">
        <Stack gap="xs" align="center">
          <Eyebrow>{eventCopy.ready.eyebrow}</Eyebrow>
          <Heading scale="headline">{event.name}</Heading>
        </Stack>
        <div className={styles.qr}>
          <QRCodeSVG
            value={event.joinUrl}
            level="M"
            marginSize={3}
            bgColor="transparent"
            fgColor="currentColor"
            title={eventCopy.ready.qrLabel(event.name)}
            className={styles.qrCode}
          />
        </div>
        <Text scale="small" tone="muted" className={styles.url}>
          {event.joinUrl}
        </Text>
        {event.infoUrl && (
          <Text scale="small" className={styles.url}>
            {eventCopy.ready.moreInfo}:{" "}
            <a href={event.infoUrl} target="_blank" rel="noreferrer" className={styles.link}>
              {event.infoUrl}
            </a>
          </Text>
        )}
      </Stack>
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
          params={{ eventId: event.eventId }}
          target="_blank"
          icon="arrowRight"
        >
          {eventCopy.ready.open}
        </ButtonLink>
        <Button variant="ghost" onClick={onReset}>
          {eventCopy.ready.another}
        </Button>
      </Stack>
    </Screen>
  );
}

export { CreateEventScreen };
