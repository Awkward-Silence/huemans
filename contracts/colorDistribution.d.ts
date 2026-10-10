// Type-only wire contract for the color-distribution context. Import with `import type` only.
// A .d.ts so it never counts as a source file of the apps that import it (api builds with rootDir: src).

export type GroupColor = 'RED' | 'YELLOW' | 'GREEN' | 'BLUE';

export type PersonalityType = 'explorer' | 'connector' | 'planner' | 'dreamer';

/** Pushed in realtime to the attendee's phone and the host screen. */
export interface AttendeeGrouped {
  eventId: string;
  attendeeId: string;
  color: GroupColor;
  personalityType: PersonalityType;
}

/** GET /events/:eventId/distribution — all four colors, always present. */
export interface EventDistributionView {
  eventId: string;
  groups: {
    color: GroupColor;
    members: number;
    /** One entry per member, duplicates included. */
    personalityTypes: PersonalityType[];
  }[];
}

/** GET /events/:eventId/attendees/:attendeeId/assignment */
export interface AttendeeAssignment {
  eventId: string;
  attendeeId: string;
  color: GroupColor;
  personalityType: PersonalityType;
}

/** 404 body of the assignment read when the attendee has not been grouped yet. */
export interface AttendeeNotAssigned {
  statusCode: 404;
  error: 'not_assigned';
  message: string;
}
