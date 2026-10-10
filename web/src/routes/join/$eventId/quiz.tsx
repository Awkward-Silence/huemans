import { createFileRoute } from "@tanstack/react-router";
import { QuizScreen } from "../../../features/quiz/QuizScreen.tsx";
import { guardStep } from "../../../features/join/steps.ts";

export const Route = createFileRoute("/join/$eventId/quiz")({
  beforeLoad: guardStep("quiz"),
  component: function QuizRoute() {
    const { eventId } = Route.useParams();
    return <QuizScreen eventId={eventId} />;
  },
});
