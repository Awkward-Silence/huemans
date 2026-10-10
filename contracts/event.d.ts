// Type-only wire contract for the event context. Import with `import type` only.
// A .d.ts so it never counts as a source file of the apps that import it (api builds with rootDir: src).

export type EventStatus = 'open' | 'revealed';

/** POST /events — the name is trimmed; 1-255 characters after trimming. */
export type CreateEventRequest = {
  name: string;
};

/**
 * POST /events (201) and GET /events/:eventId (200).
 * Fits the web's EventSchema (web/src/api/schemas.ts); `status` is extra.
 */
export type EventResponse = {
  id: string;
  name: string;
  status: EventStatus;
  /** Quiz settings, owned by Participation; the same for every event in the MVP. */
  questionCount: number;
  quizDurationSeconds: number;
};
