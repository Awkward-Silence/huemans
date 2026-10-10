import { createFileRoute } from "@tanstack/react-router";
import { SortedScreen } from "../../../features/grouping/SortedScreen.tsx";
import { guardStep } from "../../../features/join/steps.ts";

export const Route = createFileRoute("/join/$eventId/sorted")({
  beforeLoad: guardStep("sorted"),
  component: function SortedRoute() {
    const { eventId } = Route.useParams();
    return <SortedScreen eventId={eventId} />;
  },
});
