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

/** POST /events/:eventId/attendees — the name is trimmed; 1-40 characters after trimming. */
export type JoinRequest = {
  name: string;
};

/** 201: a new attendee on every call, even with a name already used in the event. */
export type JoinResponse = {
  attendeeId: string;
};

/**
 * GET /events/:eventId/quiz — the same questions in the same order on every phone of the event.
 * Fits the web's QuizSchema (web/src/api/schemas.ts); answers carry no trait.
 */
export type QuizResponse = {
  questions: {
    id: string;
    theme: string;
    text: string;
    answers: { id: string; text: string }[];
  }[];
  /** The soft timer for the whole quiz; late answers are still accepted. */
  durationSeconds: number;
  /** The "I ..." sentence asked after the questions; its words come from GET /sentence-tree. */
  sentence: { id: string; starter: string; picks: number };
};
