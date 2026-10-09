import type { z } from "zod";

type ApiErrorKind = "network" | "http" | "not-found" | "invalid-response";

/** Every failure from the API layer, so screens can handle one error type. */
class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = options?.status;
  }
}

/** Validates a response body; a mismatch is a bug on one side, not a user error. */
function parseResponse<S extends z.ZodType>(schema: S, data: unknown, what: string): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError("invalid-response", `Unexpected ${what} response`, { cause: result.error });
  }
  return result.data;
}

export { ApiError, parseResponse };
export type { ApiErrorKind };
