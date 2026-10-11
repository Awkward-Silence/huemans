import { z } from "zod";
import { GroupColorSchema } from "../domain/groupColor.ts";

/**
 * Wire format between web/ and api/, validated on every response.
 *
 * TODO(contracts): these shapes are the web side's proposal. When contracts/
 * exists, move the plain types there and check these schemas against them with
 * `import type` + `satisfies z.ZodType<Contract>` (no runtime import).
 */

const IdSchema = z.string().min(1);

const EventSchema = z.object({
  id: IdSchema,
  name: z.string(),
  quizDurationSeconds: z.number().int().positive(),
  questionCount: z.number().int().positive(),
});

const JoinRequestSchema = z.object({ name: z.string() });
const JoinResponseSchema = z.object({ attendeeId: IdSchema });

const QuestionSchema = z.object({
  id: IdSchema,
  theme: z.string(),
  text: z.string().min(1),
  answers: z.array(z.object({ id: IdSchema, text: z.string().min(1) })).length(4),
});

/** The "I ..." sentence builder: the last quiz question, for fun only (no trait). */
const SentenceQuestionSchema = z.object({
  id: IdSchema,
  starter: z.string().min(1),
  /** How many words the attendee adds after the starter. */
  picks: z.number().int().positive(),
});

const QuizSchema = z.object({
  questions: z.array(QuestionSchema).min(1),
  durationSeconds: z.number().int().positive(),
  /** Optional so an api/ without the sentence question still works. */
  sentence: SentenceQuestionSchema.optional(),
});

const WordSuggestionsRequestSchema = z.object({
  attendeeId: IdSchema,
  /** The words so far, starting with the starter. */
  sentence: z.array(z.string().min(1)).min(1),
});

const WordSuggestionsSchema = z.object({
  words: z.array(z.string().min(1)).length(3),
  source: z.enum(["ai", "fallback"]),
});

const SubmitAnswersRequestSchema = z.object({
  answers: z.array(z.object({ questionId: IdSchema, answerId: IdSchema })),
  elapsedMs: z.number().int().nonnegative(),
  /** The finished "I ..." sentence; api/ lets Jev weigh its traits. Null when skipped. */
  sentence: z.object({ question: z.string().min(1), answer: z.string().min(1) }).nullable(),
});

/** Grouping runs after submit, so the assignment can be pending for a moment. */
const AssignmentSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("pending") }),
  z.object({
    status: z.literal("assigned"),
    color: GroupColorSchema,
    nickname: z.string(),
    blurb: z.string(),
    traits: z.array(z.string()),
    /** Other people in the same group. */
    mates: z.number().int().nonnegative(),
    reason: z.object({
      /** How the answers leaned, strongest first. */
      lean: z.array(z.object({ color: GroupColorSchema, percent: z.number().min(0).max(100) })),
      text: z.string(),
    }),
  }),
]);

const RoomSchema = z.object({
  answered: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  groups: z.array(z.object({ color: GroupColorSchema, count: z.number().int().nonnegative() })),
});

const IcebreakerSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("locked") }),
  z.object({
    status: z.literal("ready"),
    question: z.string().min(1),
    why: z.string(),
    meetingSpot: z.string(),
    /** When the gathering countdown ends (ISO date-time). */
    gatherEndsAt: z.iso.datetime(),
  }),
]);

type Event = z.infer<typeof EventSchema>;
type JoinRequest = z.infer<typeof JoinRequestSchema>;
type JoinResponse = z.infer<typeof JoinResponseSchema>;
type Question = z.infer<typeof QuestionSchema>;
type SentenceQuestion = z.infer<typeof SentenceQuestionSchema>;
type Quiz = z.infer<typeof QuizSchema>;
type WordSuggestionsRequest = z.infer<typeof WordSuggestionsRequestSchema>;
type WordSuggestions = z.infer<typeof WordSuggestionsSchema>;
type SubmitAnswersRequest = z.infer<typeof SubmitAnswersRequestSchema>;
type Assignment = z.infer<typeof AssignmentSchema>;
type AssignedGroup = Extract<Assignment, { status: "assigned" }>;
type Room = z.infer<typeof RoomSchema>;
type Icebreaker = z.infer<typeof IcebreakerSchema>;
type ReadyIcebreaker = Extract<Icebreaker, { status: "ready" }>;

export {
  AssignmentSchema,
  EventSchema,
  IcebreakerSchema,
  JoinRequestSchema,
  JoinResponseSchema,
  QuestionSchema,
  QuizSchema,
  RoomSchema,
  SentenceQuestionSchema,
  SubmitAnswersRequestSchema,
  WordSuggestionsRequestSchema,
  WordSuggestionsSchema,
};
export type {
  AssignedGroup,
  Assignment,
  Event,
  Icebreaker,
  JoinRequest,
  JoinResponse,
  Question,
  Quiz,
  ReadyIcebreaker,
  Room,
  SentenceQuestion,
  SubmitAnswersRequest,
  WordSuggestions,
  WordSuggestionsRequest,
};
