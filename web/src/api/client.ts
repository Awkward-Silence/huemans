import type {
  Assignment,
  Event,
  Icebreaker,
  JoinRequest,
  JoinResponse,
  Quiz,
  Room,
  SubmitAnswersRequest,
} from "./schemas.ts";

/**
 * Everything the attendee app asks of the backend. Implementations must
 * return data that already passed its schema.
 */
interface ApiClient {
  getEvent(eventId: string): Promise<Event>;
  join(eventId: string, body: JoinRequest): Promise<JoinResponse>;
  getQuiz(eventId: string): Promise<Quiz>;
  submitAnswers(eventId: string, attendeeId: string, body: SubmitAnswersRequest): Promise<void>;
  getAssignment(eventId: string, attendeeId: string): Promise<Assignment>;
  getRoom(eventId: string): Promise<Room>;
  getIcebreaker(eventId: string, attendeeId: string): Promise<Icebreaker>;
}

export type { ApiClient };
