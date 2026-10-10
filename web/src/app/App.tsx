import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "../theme/index.ts";
import { createQueryClient } from "./queryClient.ts";
import { createAppRouter } from "./router.tsx";

const queryClient = createQueryClient();
const router = createAppRouter(queryClient);

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export { App };
