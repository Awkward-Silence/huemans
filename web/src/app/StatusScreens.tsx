import type { ErrorComponentProps } from "@tanstack/react-router";
import { copy } from "../content/index.ts";
import { Button, ButtonLink, MessageScreen } from "../ui/index.ts";
import { config } from "../config.ts";

/** App-wide loading, error and not-found screens, wired into the router defaults. */

function PendingScreen() {
  return <MessageScreen title={copy.app.loading} busy />;
}

function ErrorScreen({ reset }: Pick<ErrorComponentProps, "reset">) {
  return (
    <MessageScreen
      title={copy.app.errorTitle}
      body={copy.app.errorBody}
      action={<Button onClick={reset}>{copy.app.retry}</Button>}
    />
  );
}

function NotFoundScreen() {
  return (
    <MessageScreen
      title={copy.app.notFoundTitle}
      body={copy.app.notFoundBody}
      action={
        import.meta.env.DEV ? (
          <ButtonLink to="/join/$eventId" params={{ eventId: config.demoEventId }}>
            {copy.home.demoLink}
          </ButtonLink>
        ) : undefined
      }
    />
  );
}

export { ErrorScreen, NotFoundScreen, PendingScreen };
