import { createFileRoute } from "@tanstack/react-router";
import { IntroScreen } from "../../../features/join/IntroScreen.tsx";
import { guardStep } from "../../../features/join/steps.ts";

export const Route = createFileRoute("/join/$eventId/")({
  beforeLoad: guardStep("intro"),
  component: function IntroRoute() {
    const { eventId } = Route.useParams();
    return <IntroScreen eventId={eventId} />;
  },
});
