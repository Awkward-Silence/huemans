import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { api } from "../../api/index.ts";
import { createQueryClient } from "../../app/queryClient.ts";
import { createAppRouter } from "../../app/router.tsx";

/** The whole app at a URL, on the mock API, as if the host had just loaded or reloaded it. */
function openAt(url: string) {
  const queryClient = createQueryClient();
  const router = createAppRouter(queryClient);
  router.update({ ...router.options, history: createMemoryHistory({ initialEntries: [url] }) });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("host page", () => {
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
});
