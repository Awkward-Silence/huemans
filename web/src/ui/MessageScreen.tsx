import type { ReactNode } from "react";
import { Screen } from "./Screen.tsx";
import { Stack } from "./Stack.tsx";
import { Heading, Text } from "./Text.tsx";

type MessageScreenProps = {
  title: string;
  body?: string;
  /** Usually a Button or ButtonLink. */
  action?: ReactNode;
  /** Marks the screen busy, for loading states. */
  busy?: boolean;
};

/** A whole screen with one message: loading, errors, "not yet". */
function MessageScreen({ title, body, action, busy }: MessageScreenProps) {
  return (
    <Screen>
      <Stack gap="md" grow justify="center" aria-busy={busy || undefined} aria-live="polite">
        <Heading scale="title">{title}</Heading>
        {body && (
          <Text scale="bodyL" tone="muted" measure={30}>
            {body}
          </Text>
        )}
      </Stack>
      {action && <Stack pushEnd>{action}</Stack>}
    </Screen>
  );
}

export { MessageScreen };
