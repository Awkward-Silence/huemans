import { config } from "../config.ts";
import type { ApiClient } from "./client.ts";
import { createHttpClient } from "./httpClient.ts";
import { SENTENCE_QUESTION } from "./mock/fixtures/words.ts";
import { createMockClient } from "./mock/mockClient.ts";

/**
 * The client the app uses, picked by VITE_API_MODE. api/'s quiz has no
 * sentence question yet, so http mode adds the mock's until it does.
 */
function createClient(): ApiClient {
  if (config.apiMode === "mock") return createMockClient();
  const http = createHttpClient(config.apiUrl);
  return {
    ...http,
    getQuiz: async (eventId) => {
      const quiz = await http.getQuiz(eventId);
      return { ...quiz, sentence: quiz.sentence ?? SENTENCE_QUESTION };
    },
  };
}

const api: ApiClient = createClient();

export { api };
export { ApiError } from "./errors.ts";
export type { ApiClient } from "./client.ts";
export * from "./schemas.ts";
