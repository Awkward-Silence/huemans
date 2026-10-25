// Type-only wire contract for the room context. Import with `import type` only.
// A .d.ts so it never counts as a source file of the apps that import it (api builds with rootDir: src).

import type { GroupColor } from './colorDistribution';

/**
 * GET /events/:eventId/room — polled by the "waiting for the room" screen.
 * Fits the web's RoomSchema (web/src/api/schemas.ts); `eventId` is extra.
 */
export type RoomResponse = {
  eventId: string;
  /** Attendees who joined the event. Equals `answered` until Participation records joins. */
  total: number;
  /** Attendees with a group color; the sum of the group counts. Never above `total`. */
  answered: number;
  /** All four colors, in the order amber, coral, teal, violet, zeros included. */
  groups: { color: GroupColor; count: number }[];
};
