import { config } from "../config.ts";
import type { ApiClient } from "./client.ts";
import { createHttpClient } from "./httpClient.ts";
import { createMockClient } from "./mock/mockClient.ts";

/** The client the app uses, picked by VITE_API_MODE. */
const api: ApiClient =
  config.apiMode === "http" ? createHttpClient(config.apiUrl) : createMockClient();

export { api };
export { ApiError } from "./errors.ts";
export type { ApiClient } from "./client.ts";
export * from "./schemas.ts";
