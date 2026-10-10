import { useCallback, useSyncExternalStore } from "react";
import { z } from "zod";
import { readJson, removeKey, writeJson } from "../../lib/storage.ts";

/**
 * What this phone remembers about the attendee, per event. Kept in
 * localStorage so a refresh (or a locked phone) resumes the flow.
 */
const SessionSchema = z.object({
  attendeeId: z.string().optional(),
  name: z.string().optional(),
  /** questionId -> answerId, in answer order. */
  answers: z.record(z.string(), z.string()).default({}),
  /** Words picked for the "I ..." sentence, starter excluded. Stays on the phone. */
  sentence: z.array(z.string()).default([]),
  sentenceSkipped: z.boolean().default(false),
  quizStartedAt: z.number().optional(),
  quizFinishedAt: z.number().optional(),
  submitted: z.boolean().default(false),
});

type Session = z.infer<typeof SessionSchema>;

const EMPTY: Session = { answers: {}, sentence: [], sentenceSkipped: false, submitted: false };
const storageKey = (eventId: string) => `huemans:session:${eventId}`;

const cache = new Map<string, Session>();
const listeners = new Set<() => void>();

function getSession(eventId: string): Session {
  let session = cache.get(eventId);
  if (!session) {
    session = readJson(storageKey(eventId), SessionSchema) ?? EMPTY;
    cache.set(eventId, session);
  }
  return session;
}

function updateSession(
  eventId: string,
  change: Partial<Session> | ((session: Session) => Session),
) {
  const current = getSession(eventId);
  const next = typeof change === "function" ? change(current) : { ...current, ...change };
  cache.set(eventId, next);
  writeJson(storageKey(eventId), next);
  listeners.forEach((listener) => listener());
}

function resetSession(eventId: string) {
  cache.delete(eventId);
  removeKey(storageKey(eventId));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The attendee's session for this event, re-rendering when it changes. */
function useSession(eventId: string): Session {
  const snapshot = useCallback(() => getSession(eventId), [eventId]);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/**
 * For screens after joining: route guards guarantee the attendee exists,
 * so this narrows the type instead of making every screen check.
 */
function useJoinedSession(eventId: string): Session & { attendeeId: string; name: string } {
  const session = useSession(eventId);
  if (!session.attendeeId || session.name === undefined) {
    throw new Error("useJoinedSession used before the attendee joined");
  }
  return session as Session & { attendeeId: string; name: string };
}

export { getSession, resetSession, updateSession, useJoinedSession, useSession, SessionSchema };
export type { Session };
