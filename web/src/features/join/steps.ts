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
  quiz: "/join/$eventId/quiz",
  sorted: "/join/$eventId/sorted",
  reveal: "/join/$eventId/reveal",
  room: "/join/$eventId/room",
  icebreaker: "/join/$eventId/icebreaker",
  badge: "/join/$eventId/badge",
} as const;

type Step = keyof typeof STEP_ROUTES;

/** Where the attendee is in the flow, from what the session knows. */
type Stage = "joining" | "quizzing" | "sorted";

const STEPS_BY_STAGE: Record<Stage, readonly Step[]> = {
  joining: ["intro", "name"],
  quizzing: ["quiz"],
  sorted: ["sorted", "reveal", "room", "icebreaker", "badge"],
};

/** Where to send someone who opens a step they can't be on yet (or anymore). */
const FALLBACK: Record<Stage, Step> = { joining: "intro", quizzing: "quiz", sorted: "sorted" };

function stageOf(session: Session): Stage {
  if (!session.attendeeId) return "joining";
  return session.submitted ? "sorted" : "quizzing";
}

/** The step to redirect to, or null when `step` is fine for this session. */
function redirectFor(step: Step, session: Session): Step | null {
  const stage = stageOf(session);
  return STEPS_BY_STAGE[stage].includes(step) ? null : FALLBACK[stage];
}

/** Route `beforeLoad` guard: keeps people on the step their session allows. */
function guardStep(step: Step) {
  return ({ params }: { params: { eventId: string } }) => {
    const target = redirectFor(step, getSession(params.eventId));
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

export { guardStep, redirectFor, STEP_ROUTES, stageOf, useGoToStep };
export type { Step };
