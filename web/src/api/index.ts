import { config } from "../config.ts";
import type { ApiClient } from "./client.ts";
import { createHttpClient } from "./httpClient.ts";
import { createMockClient } from "./mock/mockClient.ts";

/**
 * The client the app uses, picked by VITE_API_MODE. api/ has no join, quiz or
 * word-suggestion endpoints yet, so http mode keeps the mock for those: the
 * quiz's fixed questions are also in api/'s catalog, so it scores them.
 */
function createClient(): ApiClient {
  const mock = createMockClient();
  if (config.apiMode === "mock") return mock;
  const http = createHttpClient(config.apiUrl);
  return {
    ...http,
    join: mock.join,
    getQuiz: mock.getQuiz,
    suggestWords: mock.suggestWords,
  };
}

const api: ApiClient = createClient();

export { api };
export { ApiError } from "./errors.ts";
export type { ApiClient } from "./client.ts";
export * from "./schemas.ts";
