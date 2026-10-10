import { redirect, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { getSession, type Session } from "./session.ts";

/**
 * The attendee flow, in order. This is the one place that knows the step
 * sequence and which step each route is; screens move with `useGoToStep`.
 */
const STEP_ROUTES = {
  intro: "/join/$eventId",
  name: "/join/$eventId/name",
  welcome: "/join/$eventId/welcome",
  quiz: "/join/$eventId/quiz",
  sorted: "/join/$eventId/sorted",
  reveal: "/join/$eventId/reveal",
  room: "/join/$eventId/room",
  icebreaker: "/join/$eventId/icebreaker",
  badge: "/join/$eventId/badge",
} as const;

type Step = keyof typeof STEP_ROUTES;

/**
 * Where the attendee is in the flow, from what the session knows.
 * "returning" is a quiz in progress that this page load has not shown yet:
 * the attendee closed the tab or reloaded, and is greeted before resuming.
 */
type Stage = "joining" | "returning" | "quizzing" | "sorted";

const STEPS_BY_STAGE: Record<Stage, readonly Step[]> = {
  joining: ["intro", "name"],
  returning: ["welcome"],
  quizzing: ["quiz"],
  sorted: ["sorted", "reveal", "room", "icebreaker", "badge"],
};

/** Where to send someone who opens a step they can't be on yet (or anymore). */
const FALLBACK: Record<Stage, Step> = {
  joining: "intro",
  returning: "welcome",
  quizzing: "quiz",
  sorted: "sorted",
};

/**
 * Events whose quiz this page load has already been on (joined here, or
 * resumed from the welcome screen). Deliberately not persisted: a reload
 * or a new tab counts as coming back.
 */
const present = new Set<string>();

/** The attendee is in the flow on this page load; no welcome back needed. */
function markPresent(eventId: string) {
  present.add(eventId);
}

function stageOf(session: Session, isPresent = true): Stage {
  if (!session.attendeeId) return "joining";
  if (session.submitted) return "sorted";
  return isPresent ? "quizzing" : "returning";
}

/** The step to redirect to, or null when `step` is fine for this session. */
function redirectFor(step: Step, session: Session, isPresent = true): Step | null {
  const stage = stageOf(session, isPresent);
  return STEPS_BY_STAGE[stage].includes(step) ? null : FALLBACK[stage];
}

/** Route `beforeLoad` guard: keeps people on the step their session allows. */
function guardStep(step: Step) {
  return ({ params }: { params: { eventId: string } }) => {
    const { eventId } = params;
    const target = redirectFor(step, getSession(eventId), present.has(eventId));
    if (target) throw redirect({ to: STEP_ROUTES[target], params, replace: true });
  };
}

function useGoToStep(eventId: string) {
  const navigate = useNavigate();
  return useCallback(
    (step: Step, options?: { replace?: boolean }) =>
      navigate({ to: STEP_ROUTES[step], params: { eventId }, replace: options?.replace }),
    [eventId, navigate],
  );
}

export { guardStep, markPresent, redirectFor, STEP_ROUTES, stageOf, useGoToStep };
export type { Step };
