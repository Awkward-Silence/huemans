import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { eventQuery, useJoin } from "../../api/queries.ts";
import { copy } from "../../content/index.ts";
import { Button, SegmentedProgress, Screen, Stack, Text, TextField } from "../../ui/index.ts";
import { NAME_MAX_LENGTH, NameSchema } from "./name.ts";
import styles from "./NameScreen.module.css";
import { updateSession } from "./session.ts";
import { markPresent, useGoToStep } from "./steps.ts";

/** The three big moments the step indicator counts: name, quiz, colour. */
const JOURNEY_LENGTH = 3;

/** Step 2: pick the name that goes on the badge, then join the event. */
function NameScreen({ eventId }: { eventId: string }) {
  const { data: event } = useSuspenseQuery(eventQuery(eventId));
  const join = useJoin(eventId);
  const goTo = useGoToStep(eventId);
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const parsed = NameSchema.safeParse(name);
  const error = touched && !parsed.success ? parsed.error.issues[0]?.message : undefined;

  const onSubmit = (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    setTouched(true);
    if (!parsed.success) return;
    join.mutate(parsed.data, {
      onSuccess: ({ attendeeId }) => {
        updateSession(eventId, { attendeeId, name: parsed.data });
        markPresent(eventId);
        void goTo("quiz", { replace: true });
      },
    });
  };

  return (
    <Screen>
      <form onSubmit={onSubmit} noValidate className={styles.form}>
        <Stack gap="3xl">
          <SegmentedProgress
            total={JOURNEY_LENGTH}
            current={0}
            label={copy.name.stepLabel(1, JOURNEY_LENGTH)}
          />
          <TextField
            label={copy.name.label}
            description={copy.name.description}
            hint={copy.name.hint(NAME_MAX_LENGTH)}
            error={error}
            name="name"
            autoComplete="given-name"
            autoCapitalize="words"
            enterKeyHint="go"
            placeholder={copy.name.placeholder}
            maxLength={NAME_MAX_LENGTH}
            value={name}
            onChange={(changeEvent) => setName(changeEvent.target.value)}
            onBlur={() => setTouched(name.length > 0)}
          />
        </Stack>
        <Stack gap="lg" pushEnd>
          {join.isError && (
            <Text scale="small" tone="danger" role="alert">
              {copy.name.joinFailed}
            </Text>
          )}
          <Button
            type="submit"
            icon="arrowRight"
            loading={join.isPending}
            disabled={!parsed.success}
          >
            {copy.name.submit(event.quizDurationSeconds)}
          </Button>
          <Text scale="caption" tone="muted" align="center">
            {copy.name.privacy}
          </Text>
        </Stack>
      </form>
    </Screen>
  );
}

export { NameScreen };
