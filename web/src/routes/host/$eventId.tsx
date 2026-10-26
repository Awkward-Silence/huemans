import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { eventQuery } from "../../api/queries.ts";
import { HostScreen } from "../../features/event/HostScreen.tsx";

/** api/ does not store the info URL yet, so it rides in the URL and survives a reload. */
const HostSearchSchema = z.object({
  info: z
    .url({ protocol: /^https?$/ })
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute("/host/$eventId")({
  validateSearch: HostSearchSchema,
  loader: ({ context: { queryClient }, params: { eventId } }) =>
    queryClient.ensureQueryData(eventQuery(eventId)),
  component: function HostRoute() {
    const { eventId } = Route.useParams();
    const { info } = Route.useSearch();
    return <HostScreen eventId={eventId} infoUrl={info} />;
  },
});
