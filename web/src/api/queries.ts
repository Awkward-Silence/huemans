import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { config } from "../config.ts";
import { api } from "./index.ts";
import type { SubmitAnswersRequest } from "./schemas.ts";

/**
 * Query keys and options for every API read. Screens use the hooks; route
 * loaders use the `*Query` options to prefetch the same cache entries.
 *
 * "Live" data polls for now. When the realtime gateway lands, keep these
 * hooks and push socket events into the cache with `queryClient.setQueryData`.
 */
const queryKeys = {
  event: (eventId: string) => ["event", eventId] as const,
  quiz: (eventId: string) => ["event", eventId, "quiz"] as const,
  room: (eventId: string) => ["event", eventId, "room"] as const,
  attendee: (eventId: string, attendeeId: string) =>
    ["event", eventId, "attendee", attendeeId] as const,
  assignment: (eventId: string, attendeeId: string) =>
    [...queryKeys.attendee(eventId, attendeeId), "assignment"] as const,
  icebreaker: (eventId: string, attendeeId: string) =>
    [...queryKeys.attendee(eventId, attendeeId), "icebreaker"] as const,
};

const eventQuery = (eventId: string) =>
  queryOptions({
    queryKey: queryKeys.event(eventId),
    queryFn: () => api.getEvent(eventId),
    staleTime: Infinity,
  });

const quizQuery = (eventId: string) =>
  queryOptions({
    queryKey: queryKeys.quiz(eventId),
    queryFn: () => api.getQuiz(eventId),
    staleTime: Infinity,
  });

const assignmentQuery = (eventId: string, attendeeId: string) =>
  queryOptions({
    queryKey: queryKeys.assignment(eventId, attendeeId),
    queryFn: () => api.getAssignment(eventId, attendeeId),
    // Poll only while grouping is still running.
    refetchInterval: (query) =>
      query.state.data?.status === "assigned" ? false : config.livePollMs / 2,
  });

const roomQuery = (eventId: string) =>
  queryOptions({
    queryKey: queryKeys.room(eventId),
    queryFn: () => api.getRoom(eventId),
    refetchInterval: config.livePollMs,
  });

const icebreakerQuery = (eventId: string, attendeeId: string) =>
  queryOptions({
    queryKey: queryKeys.icebreaker(eventId, attendeeId),
    queryFn: () => api.getIcebreaker(eventId, attendeeId),
    refetchInterval: (query) => (query.state.data?.status === "ready" ? false : config.livePollMs),
  });

const useEvent = (eventId: string) => useQuery(eventQuery(eventId));
const useQuiz = (eventId: string) => useQuery(quizQuery(eventId));
const useAssignment = (eventId: string, attendeeId: string) =>
  useQuery(assignmentQuery(eventId, attendeeId));
const useRoom = (eventId: string) => useQuery(roomQuery(eventId));
const useIcebreaker = (eventId: string, attendeeId: string) =>
  useQuery(icebreakerQuery(eventId, attendeeId));

function useJoin(eventId: string) {
  return useMutation({ mutationFn: (name: string) => api.join(eventId, { name }) });
}

function useReveal(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.reveal(eventId),
    onSuccess: (event) => queryClient.setQueryData(queryKeys.event(eventId), event),
  });
}

function useSubmitAnswers(eventId: string, attendeeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitAnswersRequest) => api.submitAnswers(eventId, attendeeId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.attendee(eventId, attendeeId) }),
  });
}

export {
  assignmentQuery,
  eventQuery,
  icebreakerQuery,
  queryKeys,
  quizQuery,
  roomQuery,
  useAssignment,
  useEvent,
  useIcebreaker,
  useJoin,
  useQuiz,
  useReveal,
  useRoom,
  useSubmitAnswers,
};
