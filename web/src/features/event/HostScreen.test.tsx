import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "../../api/index.ts";
import { openAt } from "../../test/app.tsx";

describe("host page", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the event's QR code and reveals the icebreaker once", async () => {
    const event = await api.createEvent({ name: "Friday Meetup" });
    openAt(`/host/${event.id}?info=https%3A%2F%2Fmeetup.com%2Ffriday`);

    expect(await screen.findByRole("heading", { name: "Friday Meetup" })).toBeInTheDocument();
    expect(screen.getByText(`${window.location.origin}/join/${event.id}`)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://meetup.com/friday" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Reveal the icebreaker/ }));

    expect(
      await screen.findByRole("button", { name: /Icebreaker revealed on every phone/ }),
    ).toBeDisabled();
  });

  it("keeps the reveal done after a reload", async () => {
    const event = await api.createEvent({ name: "Friday Meetup" });
    await api.reveal(event.id);
    openAt(`/host/${event.id}`);

    expect(
      await screen.findByRole("button", { name: /Icebreaker revealed on every phone/ }),
    ).toBeDisabled();
  });

  it("tells the host when the reveal fails and lets them try again", async () => {
    const event = await api.createEvent({ name: "Friday Meetup" });
    vi.spyOn(api, "reveal").mockRejectedValueOnce(new ApiError("network", "offline"));
    openAt(`/host/${event.id}`);

    await userEvent.click(await screen.findByRole("button", { name: /Reveal the icebreaker/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't reveal the icebreaker. Try again.",
    );

    await userEvent.click(screen.getByRole("button", { name: /Reveal the icebreaker/ }));
    expect(
      await screen.findByRole("button", { name: /Icebreaker revealed on every phone/ }),
    ).toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows how the room is spreading over the colours", async () => {
    const event = await api.createEvent({ name: "Friday Meetup" });
    vi.spyOn(api, "getRoom").mockResolvedValue({
      answered: 8,
      total: 9,
      groups: [
        { color: "amber", count: 3 },
        { color: "coral", count: 2 },
        { color: "teal", count: 2 },
        { color: "violet", count: 1 },
      ],
    });
    openAt(`/host/${event.id}`);

    expect(
      await screen.findByRole("img", { name: "amber 3, coral 2, teal 2, violet 1" }),
    ).toBeInTheDocument();
    expect(screen.getByText("8 of 9 answered")).toBeInTheDocument();
  });
});
