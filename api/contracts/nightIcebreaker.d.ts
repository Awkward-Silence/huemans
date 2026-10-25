// Type-only wire contract for the night icebreaker context. Import with `import type` only.

export type LockedIcebreaker = { status: 'locked' };

/**
 * GET /events/:eventId/attendees/:attendeeId/icebreaker — fits the web's IcebreakerSchema.
 * Locked until the event is revealed, and while the attendee has no group.
 */
export type AttendeeIcebreakerResponse =
  | LockedIcebreaker
  | {
      status: 'ready';
      /** The same for every attendee of the event. */
      question: string;
      why: string;
      /** Where the attendee's color gathers. */
      meetingSpot: string;
      /** ISO 8601 UTC; the reveal plus 120 s, the same for everyone. */
      gatherEndsAt: string;
    };

/** GET /events/:eventId/icebreaker — the host screen; no meeting spot, since it has no color. */
export type HostIcebreakerResponse =
  | LockedIcebreaker
  | { status: 'ready'; question: string; why: string; gatherEndsAt: string };
