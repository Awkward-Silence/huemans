import { createFileRoute } from "@tanstack/react-router";
import { RevealScreen } from "../../../features/grouping/RevealScreen.tsx";
import { guardStep } from "../../../features/join/steps.ts";

export const Route = createFileRoute("/join/$eventId/reveal")({
  beforeLoad: guardStep("reveal"),
  component: function RevealRoute() {
    const { eventId } = Route.useParams();
    return <RevealScreen eventId={eventId} />;
  },
});
