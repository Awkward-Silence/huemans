import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, type AssignedGroup, type ReadyIcebreaker } from "../../api/index.ts";
import { config } from "../../config.ts";
import { uuidv7 } from "../../lib/uuid.ts";
import { openAt } from "../../test/app.tsx";
import { updateSession } from "../join/session.ts";

const group: AssignedGroup = {
  status: "assigned",
  color: "amber",
  nickname: "The Night Owls",
  blurb: "Up late, full of plans.",
  traits: ["curious"],
  mates: 3,
  reason: { lean: [], text: "Groups are mixed on purpose." },
};

const icebreaker: ReadyIcebreaker = {
  status: "ready",
  question: "What's the worst advice you ever followed?",
  why: "This room loves a story.",
  meetingSpot: "the bar",
  gatherEndsAt: new Date(Date.now() + 120_000).toISOString(),
};

describe("between the colour and the icebreaker", () => {
  let eventId: string;

  beforeEach(() => {
    eventId = uuidv7();
    updateSession(eventId, { attendeeId: uuidv7(), name: "Ana", submitted: true });
    vi.spyOn(api, "getAssignment").mockResolvedValue(group);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the attendee's colour with the icebreaker and leads back to it", async () => {
    vi.spyOn(api, "getIcebreaker").mockResolvedValue(icebreaker);
    openAt(`/join/${eventId}/icebreaker`);

    expect(await screen.findByText(icebreaker.question)).toBeInTheDocument();
    expect(screen.getByText("You're Amber · The Night Owls")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: /Back to my colour/ }));

    expect(await screen.findByRole("heading", { name: "amber" })).toBeInTheDocument();
    // Going back on purpose must not bounce straight back to the icebreaker.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByText(icebreaker.question)).not.toBeInTheDocument();
  });

  it("leads back to the colour while the icebreaker is still locked", async () => {
    vi.spyOn(api, "getIcebreaker").mockResolvedValue({ status: "locked" });
    openAt(`/join/${eventId}/icebreaker`);

    await userEvent.click(await screen.findByRole("link", { name: /Back to my colour/ }));

    expect(await screen.findByRole("heading", { name: "amber" })).toBeInTheDocument();
  });

  it("opens the icebreaker by itself when the host reveals it during the colour", async () => {
    vi.spyOn(api, "getIcebreaker")
      .mockResolvedValueOnce({ status: "locked" })
      .mockResolvedValue(icebreaker);
    openAt(`/join/${eventId}/reveal`);

    expect(await screen.findByRole("heading", { name: "amber" })).toBeInTheDocument();
    expect(
      await screen.findByText(icebreaker.question, {}, { timeout: config.livePollMs * 2 }),
    ).toBeInTheDocument();
  });
});
