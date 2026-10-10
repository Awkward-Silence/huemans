import { createFileRoute, Outlet } from "@tanstack/react-router";
import { eventQuery, quizQuery } from "../../../api/queries.ts";

/** Every attendee step needs the event; the quiz is prefetched so it opens instantly. */
export const Route = createFileRoute("/join/$eventId")({
  loader: async ({ context: { queryClient }, params: { eventId } }) => {
    void queryClient.prefetchQuery(quizQuery(eventId));
    await queryClient.ensureQueryData(eventQuery(eventId));
  },
  component: Outlet,
});
