import { createRouter } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { routeTree } from "../routeTree.gen.ts";
import { ErrorScreen, NotFoundScreen, PendingScreen } from "./StatusScreens.tsx";

type RouterContext = { queryClient: QueryClient };

function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    // Loaders read through the Query cache, so the router never caches on its own.
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: PendingScreen,
    defaultPendingMs: 300,
    defaultErrorComponent: ErrorScreen,
    defaultNotFoundComponent: NotFoundScreen,
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}

export { createAppRouter };
export type { RouterContext };
