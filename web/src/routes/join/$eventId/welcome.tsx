import { createFileRoute } from "@tanstack/react-router";
import { WelcomeBackScreen } from "../../../features/join/WelcomeBackScreen.tsx";
import { guardStep } from "../../../features/join/steps.ts";

export const Route = createFileRoute("/join/$eventId/welcome")({
  beforeLoad: guardStep("welcome"),
  component: function WelcomeRoute() {
    const { eventId } = Route.useParams();
    return <WelcomeBackScreen eventId={eventId} />;
  },
});
