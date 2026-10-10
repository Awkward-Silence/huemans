// Type-only wire contract for the color-distribution context. Import with `import type` only.
// A .d.ts so it never counts as a source file of the apps that import it (api builds with rootDir: src).

export type GroupColor = 'amber' | 'coral' | 'teal' | 'violet';

export type PersonalityType = 'explorer' | 'connector' | 'planner' | 'dreamer';

/** Pushed in realtime to the attendee's phone and the host screen. */
export type AttendeeGrouped = {
  eventId: string;
  attendeeId: string;
  color: GroupColor;
  personalityType: PersonalityType;
};

/** GET /events/:eventId/distribution — all four colors, always present. */
export type EventDistributionView = {
  eventId: string;
  groups: {
    color: GroupColor;
    members: number;
    /** One entry per member, duplicates included. */
    personalityTypes: PersonalityType[];
  }[];
};

/** GET /events/:eventId/attendees/:attendeeId/assignment — 200 once the attendee is grouped. */
export type AttendeeAssignment = {
  status: 'assigned';
  eventId: string;
  attendeeId: string;
  color: GroupColor;
  personalityType: PersonalityType;
};

/** 200 while the attendee has no group yet (not submitted, or grouping still running). Never a 404: the web stops polling on 404. */
export type AttendeePending = {
  status: 'pending';
};

/** Response of the assignment read; poll until `status` is `assigned`. An unknown event is a 404. */
export type AttendeeAssignmentResponse = AttendeeAssignment | AttendeePending;
