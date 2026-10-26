import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { eventCopy } from "../../content/event.ts";
import { Button, Eyebrow, Heading, Screen, Stack, Text, TextField } from "../../ui/index.ts";
import {
  createEvent,
  EVENT_NAME_MAX_LENGTH,
  EventNameSchema,
  InfoUrlSchema,
} from "./createEvent.ts";
import styles from "./CreateEventScreen.module.css";

/** Name the event, then hand over to its host page (/host/:eventId) with the QR code. */
function CreateEventScreen() {
  const navigate = useNavigate();
  const create = useMutation({
    mutationFn: createEvent,
    onSuccess: ({ eventId, infoUrl }) =>
      navigate({ to: "/host/$eventId", params: { eventId }, search: { info: infoUrl } }),
  });

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

export { CreateEventScreen };
