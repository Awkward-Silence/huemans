import type { ReactNode } from "react";
import { useAssignment } from "../../api/queries.ts";
import type { AssignedGroup } from "../../api/schemas.ts";
import { ErrorScreen, PendingScreen } from "../../app/StatusScreens.tsx";
import { useJoinedSession } from "../join/session.ts";

type AssignedGroupGateProps = {
  eventId: string;
  children: (group: AssignedGroup, attendeeId: string) => ReactNode;
};

/**
 * Renders its children once the attendee has a colour, with loading and
 * error screens until then. Every screen after the reveal sits behind it.
 */
function AssignedGroupGate({ eventId, children }: AssignedGroupGateProps) {
  const { attendeeId } = useJoinedSession(eventId);
  const assignment = useAssignment(eventId, attendeeId);
  if (assignment.isError) return <ErrorScreen reset={() => void assignment.refetch()} />;
  if (assignment.data?.status !== "assigned") return <PendingScreen />;
  return children(assignment.data, attendeeId);
}

export { AssignedGroupGate };
