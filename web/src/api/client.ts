import type {
  Assignment,
  CreateEventRequest,
  Event,
  Icebreaker,
  JoinRequest,
  JoinResponse,
  Quiz,
  Room,
  SentenceTreeResponse,
  SubmitAnswersRequest,
} from "./schemas.ts";

/**
 * Everything the app asks of the backend. Implementations must
 * return data that already passed its schema.
 */
interface ApiClient {
  createEvent(body: CreateEventRequest): Promise<Event>;
  getEvent(eventId: string): Promise<Event>;
  join(eventId: string, body: JoinRequest): Promise<JoinResponse>;
  getQuiz(eventId: string): Promise<Quiz>;
  submitAnswers(eventId: string, attendeeId: string, body: SubmitAnswersRequest): Promise<void>;
  getAssignment(eventId: string, attendeeId: string): Promise<Assignment>;
  getRoom(eventId: string): Promise<Room>;
  getIcebreaker(eventId: string, attendeeId: string): Promise<Icebreaker>;
  /** The whole "I ..." sentence tree; can take long while api/ generates it. */
  getSentenceTree(signal?: AbortSignal): Promise<SentenceTreeResponse>;
}

export type { ApiClient };
