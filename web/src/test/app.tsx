import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { createQueryClient } from "../app/queryClient.ts";
import { createAppRouter } from "../app/router.tsx";

/** The whole app at a URL, as if the page had just been loaded or reloaded there. */
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

export { openAt };
