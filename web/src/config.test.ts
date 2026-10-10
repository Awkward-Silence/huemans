import { afterEach, describe, expect, it, vi } from "vitest";

async function loadConfig() {
  vi.resetModules();
  return (await import("./config.ts")).config;
}

describe("config.demoEventId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps the mock's demo id when none is configured", async () => {
    vi.stubEnv("VITE_DEMO_EVENT_ID", "");

    expect((await loadConfig()).demoEventId).toBe("demo");
  });

  it("uses the seeded event id when configured", async () => {
    vi.stubEnv("VITE_DEMO_EVENT_ID", "0199c0de-0000-7000-8000-000000000001");

    expect((await loadConfig()).demoEventId).toBe("0199c0de-0000-7000-8000-000000000001");
  });
});
