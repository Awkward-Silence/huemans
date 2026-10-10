import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/errors.ts";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // A 404 or a malformed response won't fix itself on retry.
        retry: (failureCount, error) =>
          !(
            error instanceof ApiError &&
            (error.kind === "not-found" || error.kind === "invalid-response")
          ) && failureCount < 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export { createQueryClient };
