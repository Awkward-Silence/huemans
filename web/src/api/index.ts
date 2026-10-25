import { config } from "../config.ts";
import type { ApiClient } from "./client.ts";
import { createHttpClient } from "./httpClient.ts";
import { SENTENCE_QUESTION } from "./mock/fixtures/words.ts";
import { createMockClient } from "./mock/mockClient.ts";

/**
 * The client the app uses, picked by VITE_API_MODE. api/ has no
 * word-suggestion endpoint and no sentence question in the quiz yet, so http
 * mode keeps the mock for both until word-suggestions lands.
 */
function createClient(): ApiClient {
  const mock = createMockClient();
  if (config.apiMode === "mock") return mock;
  const http = createHttpClient(config.apiUrl);
  return {
    ...http,
    getQuiz: async (eventId) => {
      const quiz = await http.getQuiz(eventId);
      return { ...quiz, sentence: quiz.sentence ?? SENTENCE_QUESTION };
    },
    suggestWords: mock.suggestWords,
  };
}

const api: ApiClient = createClient();

export { api };
export { ApiError } from "./errors.ts";
export type { ApiClient } from "./client.ts";
export * from "./schemas.ts";
