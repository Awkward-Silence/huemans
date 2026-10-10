import { z } from "zod";
import { sentenceTree } from "../../content/index.ts";
import { GROUP_COLORS, GroupColorSchema } from "../../domain/groupColor.ts";
import { nextWords } from "../../domain/sentence.ts";
import { readJson, writeJson } from "../../lib/storage.ts";
import type { ApiClient } from "../client.ts";
import { ApiError, parseResponse } from "../errors.ts";
import {
  AssignmentSchema,
  EventSchema,
  IcebreakerSchema,
  JoinResponseSchema,
  QuizSchema,
  RoomSchema,
  WordSuggestionsSchema,
} from "../schemas.ts";
import { CROWD_WEIGHTS, GROUP_PROFILES, ICEBREAKER } from "./fixtures/groups.ts";
import questionBank from "./fixtures/questions.json";
import { SENTENCE_QUESTION } from "./fixtures/words.ts";
import { distribute, type Counts } from "./grouping.ts";

/**
 * An in-browser backend for building and demoing the attendee flow without
 * api/. It simulates a room of other people answering, so the room screen
 * fills up and the icebreaker unlocks by itself. State is kept in
 * localStorage so a refresh resumes where you were.
 */

type MockOptions = {
  latencyMs: number;
  /** Word suggestions stand in for an AI call, so they take a bit longer. */
  suggestLatencyMs: number;
  quizDurationSeconds: number;
  questionCount: number;
  /** Simulated people besides you. */
  crowdSize: number;
  /** Share of the crowd already done when you submit. */
  crowdHeadStart: number;
  /** Time for the rest of the crowd to finish after you submit. */
  crowdFinishMs: number;
  /** How long "grouping" takes after a submit. */
  groupingDelayMs: number;
  gatherSeconds: number;
  now: () => number;
  /** Picks the group colour; replace it in tests to get a known colour. */
  random: () => number;
  persist: boolean;
};

const DEFAULT_OPTIONS: MockOptions = {
  latencyMs: 250,
  suggestLatencyMs: 600,
  quizDurationSeconds: 20,
  questionCount: questionBank.length,
  crowdSize: 47,
  crowdHeadStart: 0.8,
  crowdFinishMs: 15_000,
  groupingDelayMs: 1_200,
  gatherSeconds: 120,
  now: () => Date.now(),
  random: () => Math.random(),
  persist: true,
};

const AttendeeStateSchema = z.object({
  name: z.string(),
  traits: z.array(z.string()).optional(),
  submittedAt: z.number().optional(),
  color: GroupColorSchema.optional(),
});

const EventStateSchema = z.object({
  attendees: z.record(z.string(), AttendeeStateSchema),
  firstSubmitAt: z.number().optional(),
});

type EventState = z.infer<typeof EventStateSchema>;
type AttendeeState = z.infer<typeof AttendeeStateSchema>;

const storageKey = (eventId: string) => `huemans:mock:${eventId}`;

function createMockClient(overrides: Partial<MockOptions> = {}): ApiClient {
  const options = { ...DEFAULT_OPTIONS, ...overrides };
  const memory = new Map<string, EventState>();

  const load = (eventId: string): EventState =>
    memory.get(eventId) ??
    (options.persist ? readJson(storageKey(eventId), EventStateSchema) : undefined) ?? {
      attendees: {},
    };

  const save = (eventId: string, state: EventState) => {
    memory.set(eventId, state);
    if (options.persist) writeJson(storageKey(eventId), state);
  };

  const respond = async <T>(produce: () => T, latencyMs = options.latencyMs): Promise<T> => {
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
    return produce();
  };

  const findAttendee = (state: EventState, attendeeId: string): AttendeeState => {
    const attendee = state.attendees[attendeeId];
    if (!attendee) throw new ApiError("not-found", "Unknown attendee", { status: 404 });
    return attendee;
  };

  /** 0 before anyone submits, then rising to 1 as the simulated crowd finishes. */
  const crowdProgress = (state: EventState) => {
    if (state.firstSubmitAt === undefined) return 0;
    const finishing = Math.min(1, (options.now() - state.firstSubmitAt) / options.crowdFinishMs);
    return options.crowdHeadStart + (1 - options.crowdHeadStart) * finishing;
  };

  const roomCounts = (state: EventState) => {
    const crowdAnswered = Math.round(options.crowdSize * crowdProgress(state));
    const counts: Counts = distribute(crowdAnswered, CROWD_WEIGHTS);
    const people = Object.values(state.attendees);
    for (const person of people) if (person.color) counts[person.color] += 1;
    const submitted = people.filter((person) => person.submittedAt !== undefined).length;
    return {
      counts,
      answered: crowdAnswered + submitted,
      total: options.crowdSize + people.length,
    };
  };

  const unlockAt = (state: EventState) =>
    state.firstSubmitAt === undefined ? undefined : state.firstSubmitAt + options.crowdFinishMs;

  return {
    getEvent: (eventId) =>
      respond(() =>
        parseResponse(
          EventSchema,
          {
            id: eventId,
            name: "Demo night",
            quizDurationSeconds: options.quizDurationSeconds,
            questionCount: options.questionCount,
          },
          "event",
        ),
      ),

    join: (eventId, body) =>
      respond(() => {
        const state = load(eventId);
        const attendeeId = crypto.randomUUID();
        state.attendees[attendeeId] = { name: body.name };
        save(eventId, state);
        return parseResponse(JoinResponseSchema, { attendeeId }, "join");
      }),

    getQuiz: () =>
      respond(() =>
        parseResponse(
          QuizSchema,
          {
            questions: questionBank.slice(0, options.questionCount),
            durationSeconds: options.quizDurationSeconds,
            sentence: SENTENCE_QUESTION,
          },
          "quiz",
        ),
      ),

    submitAnswers: (eventId, attendeeId, body) =>
      respond(() => {
        const state = load(eventId);
        const attendee = findAttendee(state, attendeeId);
        const traits = body.answers.flatMap(({ questionId, answerId }) => {
          const question = questionBank.find((candidate) => candidate.id === questionId);
          const answer = question?.answers.find((candidate) => candidate.id === answerId);
          return answer ? [answer.trait] : [];
        });
        // Each phone runs its own mock and can't see the others, so a random colour
        // spreads a real room better than the answers would (they lean amber).
        const color = GROUP_COLORS[Math.floor(options.random() * GROUP_COLORS.length)]!;
        const now = options.now();
        state.attendees[attendeeId] = { ...attendee, traits, submittedAt: now, color };
        state.firstSubmitAt ??= now;
        save(eventId, state);
      }),

    getAssignment: (eventId, attendeeId) =>
      respond(() => {
        const state = load(eventId);
        const attendee = findAttendee(state, attendeeId);
        const ready =
          attendee.submittedAt !== undefined &&
          options.now() - attendee.submittedAt >= options.groupingDelayMs;
        if (!ready || !attendee.color) {
          return parseResponse(AssignmentSchema, { status: "pending" }, "assignment");
        }
        const profile = GROUP_PROFILES[attendee.color];
        return parseResponse(
          AssignmentSchema,
          {
            status: "assigned",
            color: attendee.color,
            nickname: profile.nickname,
            blurb: profile.blurb,
            traits: profile.traits,
            mates: Math.max(0, roomCounts(state).counts[attendee.color] - 1),
            reason: {
              lean: [],
              text: "Groups are mixed on purpose, so you'll meet people who answered differently.",
            },
          },
          "assignment",
        );
      }),

    getRoom: (eventId) =>
      respond(() => {
        const { counts, answered, total } = roomCounts(load(eventId));
        return parseResponse(
          RoomSchema,
          {
            answered,
            total,
            groups: GROUP_COLORS.map((color) => ({ color, count: counts[color] })),
          },
          "room",
        );
      }),

    getIcebreaker: (eventId, attendeeId) =>
      respond(() => {
        const state = load(eventId);
        const attendee = findAttendee(state, attendeeId);
        const unlocksAt = unlockAt(state);
        if (unlocksAt === undefined || options.now() < unlocksAt || !attendee.color) {
          return parseResponse(IcebreakerSchema, { status: "locked" }, "icebreaker");
        }
        return parseResponse(
          IcebreakerSchema,
          {
            status: "ready",
            question: ICEBREAKER.question,
            why: ICEBREAKER.why,
            meetingSpot: GROUP_PROFILES[attendee.color].meetingSpot,
            gatherEndsAt: new Date(unlocksAt + options.gatherSeconds * 1000).toISOString(),
          },
          "icebreaker",
        );
      }),

    suggestWords: (_eventId, questionId, body) =>
      respond(() => {
        if (questionId !== SENTENCE_QUESTION.id) {
          throw new ApiError("not-found", "Unknown sentence question", { status: 404 });
        }
        const { sentence } = body;
        if (
          sentence[0] !== SENTENCE_QUESTION.starter ||
          sentence.length > SENTENCE_QUESTION.picks
        ) {
          throw new ApiError("http", "Invalid sentence", { status: 400 });
        }
        return parseResponse(
          WordSuggestionsSchema,
          { words: nextWords(sentenceTree, sentence), source: "ai" },
          "word suggestions",
        );
      }, options.suggestLatencyMs),
  };
}

export { createMockClient, DEFAULT_OPTIONS as DEFAULT_MOCK_OPTIONS };
export type { MockOptions };
