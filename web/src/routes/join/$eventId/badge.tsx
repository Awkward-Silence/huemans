import { createFileRoute } from "@tanstack/react-router";
import { BadgeScreen } from "../../../features/gathering/BadgeScreen.tsx";
import { guardStep } from "../../../features/join/steps.ts";

export const Route = createFileRoute("/join/$eventId/badge")({
  beforeLoad: guardStep("badge"),
  component: function BadgeRoute() {
    const { eventId } = Route.useParams();
    return <BadgeScreen eventId={eventId} />;
  },
});
