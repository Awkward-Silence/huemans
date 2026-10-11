// Type-only wire contract for the participation context. Import with `import type` only.
// A .d.ts so it never counts as a source file of the apps that import it (api builds with rootDir: src).

import type { GroupColor, PersonalityType } from './colorDistribution';

/**
 * POST /events/:eventId/attendees/:attendeeId/answers.
 * Fits the web's SubmitAnswersRequestSchema (web/src/api/schemas.ts); `sentence` is new and optional.
 */
export type SubmitAnswersRequest = {
  /** Unknown question or answer ids are ignored. */
  answers: { questionId: string; answerId: string }[];
  /** Soft timer: any value is accepted. */
  elapsedMs?: number;
  /** The "I ..." sentence builder: its question and the finished sentence. Omit (or null) when skipped. */
  sentence?: { question: string; answer: string } | null;
};

/** 200 with the attendee's group, assigned on this call. A repeated submission returns the first group. */
export type SubmitAnswersResponse = {
  status: 'assigned';
  color: GroupColor;
  personalityType: PersonalityType;
};
