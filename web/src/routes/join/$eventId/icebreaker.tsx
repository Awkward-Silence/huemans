import { createFileRoute } from "@tanstack/react-router";
import { IcebreakerScreen } from "../../../features/gathering/IcebreakerScreen.tsx";
import { guardStep } from "../../../features/join/steps.ts";

export const Route = createFileRoute("/join/$eventId/icebreaker")({
  beforeLoad: guardStep("icebreaker"),
  component: function IcebreakerRoute() {
    const { eventId } = Route.useParams();
    return <IcebreakerScreen eventId={eventId} />;
  },
});
