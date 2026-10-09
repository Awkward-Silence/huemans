import { createFileRoute } from "@tanstack/react-router";
import { NameScreen } from "../../../features/join/NameScreen.tsx";
import { guardStep } from "../../../features/join/steps.ts";

export const Route = createFileRoute("/join/$eventId/name")({
  beforeLoad: guardStep("name"),
  component: function NameRoute() {
    const { eventId } = Route.useParams();
    return <NameScreen eventId={eventId} />;
  },
});
