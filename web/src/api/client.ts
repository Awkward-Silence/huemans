import type {
  Assignment,
  CreateEventRequest,
  Event,
  Icebreaker,
  JoinRequest,
  JoinResponse,
  Quiz,
  Room,
  SubmitAnswersRequest,
  WordSuggestions,
  WordSuggestionsRequest,
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
  /** The next 3 words for the sentence question. */
  suggestWords(
    eventId: string,
    questionId: string,
    body: WordSuggestionsRequest,
  ): Promise<WordSuggestions>;
}

export type { ApiClient };
