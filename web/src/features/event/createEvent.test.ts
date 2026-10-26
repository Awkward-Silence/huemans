import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../../api/index.ts";
import {
  createEvent,
  EVENT_NAME_MAX_LENGTH,
  EventNameSchema,
  InfoUrlSchema,
  joinUrlFor,
} from "./createEvent.ts";

describe("EventNameSchema", () => {
  it("trims the name", () => {
    expect(EventNameSchema.parse("  Friday Meetup ")).toBe("Friday Meetup");
  });

  it("rejects an empty or too long name", () => {
    expect(EventNameSchema.safeParse("   ").success).toBe(false);
    expect(EventNameSchema.safeParse("x".repeat(EVENT_NAME_MAX_LENGTH + 1)).success).toBe(false);
  });
});

describe("InfoUrlSchema", () => {
  it("is optional", () => {
    expect(InfoUrlSchema.parse("  ")).toBeUndefined();
  });

  it("adds https:// when the scheme is missing", () => {
    expect(InfoUrlSchema.parse("meetup.com/friday")).toBe("https://meetup.com/friday");
    expect(InfoUrlSchema.parse("http://example.org")).toBe("http://example.org");
  });

  it("rejects text that is not a link", () => {
    expect(InfoUrlSchema.safeParse("not a link").success).toBe(false);
  });
});

describe("joinUrlFor", () => {
  it("points at the attendee entry point", () => {
    expect(joinUrlFor("demo", "https://huemans.app")).toBe("https://huemans.app/join/demo");
  });
});

describe("createEvent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("joins the event the api created, without sending the info URL", async () => {
    const create = vi.spyOn(api, "createEvent").mockResolvedValue({
      id: "0199c0de-0000-7000-8000-000000000002",
      name: "Friday Meetup",
      status: "open",
      quizDurationSeconds: 20,
      questionCount: 5,
    });

    const event = await createEvent({
      name: "Friday Meetup",
      infoUrl: "https://meetup.com/friday",
    });

    expect(create).toHaveBeenCalledWith({ name: "Friday Meetup" });
    expect(event).toEqual({
      eventId: "0199c0de-0000-7000-8000-000000000002",
      infoUrl: "https://meetup.com/friday",
    });
  });
});
