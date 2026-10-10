import { z } from "zod";
import { GROUP_COLORS, GroupColorSchema } from "../../domain/groupColor.ts";
import { pickWords } from "../../domain/sentence.ts";
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
import { MOCK_WORD_POOLS, SENTENCE_QUESTION } from "./fixtures/words.ts";
import { distribute, leanFromTraits, pickGroup, type Counts } from "./grouping.ts";

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
  persist: boolean;
};

const DEFAULT_OPTIONS: MockOptions = {
  latencyMs: 250,
  suggestLatencyMs: 600,
  quizDurationSeconds: 20,
  questionCount: 4,
  crowdSize: 47,
  crowdHeadStart: 0.8,
  crowdFinishMs: 15_000,
  groupingDelayMs: 1_200,
  gatherSeconds: 120,
  now: () => Date.now(),
  persist: true,
};

const AttendeeStateSchema = z.object({
  name: z.string(),
  traits: z.array(z.string()).optional(),
  submittedAt: z.number().optional(),
  color: GroupColorSchema.optional(),
  lean: z.array(z.object({ color: GroupColorSchema, percent: z.number() })).optional(),
  balanced: z.boolean().optional(),
});

const EventStateSchema = z.object({
  attendees: z.record(z.string(), AttendeeStateSchema),
  firstSubmitAt: z.number().optional(),
});

type EventState = z.infer<typeof EventStateSchema>;
type AttendeeState = z.infer<typeof AttendeeStateSchema>;

const storageKey = (eventId: string) => `huemans:mock:${eventId}`;

/** Stable pseudo-random pick of questions per event, so every phone gets the same quiz. */
function pickQuestions(eventId: string, count: number) {
  let seed = [...eventId].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  const pool = [...questionBank];
  const picked = [];
  while (picked.length < count && pool.length > 0) {
    seed = (seed * 1_103_515_245 + 12_345) >>> 0;
    picked.push(pool.splice(seed % pool.length, 1)[0]!);
  }
  return picked;
}

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

    getQuiz: (eventId) =>
      respond(() =>
        parseResponse(
          QuizSchema,
          {
            questions: pickQuestions(eventId, options.questionCount),
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
        const lean = leanFromTraits(traits);
        const { color, balanced } = pickGroup(lean, roomCounts(state).counts);
        const now = options.now();
        state.attendees[attendeeId] = {
          ...attendee,
          traits,
          submittedAt: now,
          color,
          lean,
          balanced,
        };
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
        const lean = attendee.lean ?? [];
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
              lean,
              text: attendee.balanced
                ? "Both groups were nearly full, so the tie went to the smaller one."
                : "Most of your answers pointed here, and there was room for you.",
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
        const pool = MOCK_WORD_POOLS[sentence.length - 1] ?? [];
        return parseResponse(
          WordSuggestionsSchema,
          { words: pickWords(pool, sentence), source: "ai" },
          "word suggestions",
        );
      }, options.suggestLatencyMs),
  };
}

export { createMockClient, DEFAULT_OPTIONS as DEFAULT_MOCK_OPTIONS };
export type { MockOptions };
