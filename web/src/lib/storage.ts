import type { z } from "zod";

/**
 * localStorage helpers that never throw: private windows and blocked storage
 * behave like an empty store, and data that fails its schema is ignored.
 */
function readJson<S extends z.ZodType>(key: string, schema: S): z.infer<S> | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return undefined;
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : undefined;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the app keeps working, it just won't survive a refresh.
  }
}

function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Same as above.
  }
}

export { readJson, removeKey, writeJson };
