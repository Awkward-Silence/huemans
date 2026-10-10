import { createFileRoute } from "@tanstack/react-router";
import { CreateEventScreen } from "../features/event/CreateEventScreen.tsx";

export const Route = createFileRoute("/event")({
  component: CreateEventScreen,
});
