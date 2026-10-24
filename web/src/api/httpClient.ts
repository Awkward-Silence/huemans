import type { z } from "zod";
import type { ApiClient } from "./client.ts";
import { ApiError, parseResponse } from "./errors.ts";
import {
  AssignmentSchema,
  EventSchema,
  IcebreakerSchema,
  JoinResponseSchema,
  QuizSchema,
  RoomSchema,
  WordSuggestionsSchema,
} from "./schemas.ts";

/** Talks to the NestJS api/ app over REST. */
function createHttpClient(baseUrl: string): ApiClient {
  async function request<S extends z.ZodType>(
    path: string,
    schema: S | null,
    init?: { method?: "GET" | "POST"; body?: unknown },
  ): Promise<z.infer<S>> {
    let response: Response;
    try {
      response = await fetch(new URL(path, baseUrl), {
        method: init?.method ?? "GET",
        headers: init?.body === undefined ? undefined : { "Content-Type": "application/json" },
        body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      });
    } catch (cause) {
      throw new ApiError("network", `Could not reach ${path}`, { cause });
    }
    if (response.status === 404)
      throw new ApiError("not-found", `${path} not found`, { status: 404 });
    if (!response.ok) {
      throw new ApiError("http", `${path} failed with ${response.status}`, {
        status: response.status,
      });
    }
    if (!schema) return undefined as z.infer<S>;
    return parseResponse(schema, await response.json(), path);
  }

  const event = (eventId: string) => `/events/${encodeURIComponent(eventId)}`;
  const attendee = (eventId: string, attendeeId: string) =>
    `${event(eventId)}/attendees/${encodeURIComponent(attendeeId)}`;

  return {
    createEvent: (body) => request("/events", EventSchema, { method: "POST", body }),
    getEvent: (eventId) => request(event(eventId), EventSchema),
    join: (eventId, body) =>
      request(`${event(eventId)}/attendees`, JoinResponseSchema, { method: "POST", body }),
    getQuiz: (eventId) => request(`${event(eventId)}/quiz`, QuizSchema),
    submitAnswers: async (eventId, attendeeId, body) => {
      await request(`${attendee(eventId, attendeeId)}/answers`, null, { method: "POST", body });
    },
    getAssignment: (eventId, attendeeId) =>
      request(`${attendee(eventId, attendeeId)}/assignment`, AssignmentSchema),
    getRoom: (eventId) => request(`${event(eventId)}/room`, RoomSchema),
    getIcebreaker: (eventId, attendeeId) =>
      request(`${attendee(eventId, attendeeId)}/icebreaker`, IcebreakerSchema),
    suggestWords: (eventId, questionId, body) =>
      request(
        `${event(eventId)}/questions/${encodeURIComponent(questionId)}/word-suggestions`,
        WordSuggestionsSchema,
        { method: "POST", body },
      ),
  };
}

export { createHttpClient };
