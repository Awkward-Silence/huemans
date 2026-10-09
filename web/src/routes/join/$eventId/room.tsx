import { createFileRoute } from "@tanstack/react-router";
import { RoomScreen } from "../../../features/grouping/RoomScreen.tsx";
import { guardStep } from "../../../features/join/steps.ts";

export const Route = createFileRoute("/join/$eventId/room")({
  beforeLoad: guardStep("room"),
  component: function RoomRoute() {
    const { eventId } = Route.useParams();
    return <RoomScreen eventId={eventId} />;
  },
});
