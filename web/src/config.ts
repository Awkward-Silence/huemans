import { z } from "zod";

/** App configuration, read once from Vite env vars and validated at startup. */
const ConfigSchema = z.object({
  apiMode: z.enum(["mock", "http"]).default("mock"),
  apiUrl: z.url().default("http://localhost:3000"),
  defaultTheme: z.string().min(1).default("default"),
  /** How long the intro plays before moving on by itself. */
  introAutoAdvanceMs: z.coerce.number().int().nonnegative().default(4500),
  /** Polling interval for "live" data until realtime replaces it. */
  livePollMs: z.coerce.number().int().positive().default(2000),
});

type Config = z.infer<typeof ConfigSchema>;

const config: Config = ConfigSchema.parse({
  apiMode: import.meta.env.VITE_API_MODE || undefined,
  apiUrl: import.meta.env.VITE_API_URL || undefined,
  defaultTheme: import.meta.env.VITE_DEFAULT_THEME || undefined,
  introAutoAdvanceMs: import.meta.env.VITE_INTRO_AUTO_ADVANCE_MS || undefined,
  livePollMs: import.meta.env.VITE_LIVE_POLL_MS || undefined,
});

export { config };
export type { Config };
