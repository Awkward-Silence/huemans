import { createFileRoute } from "@tanstack/react-router";
import { HomeScreen } from "../features/join/HomeScreen.tsx";

export const Route = createFileRoute("/")({
  component: HomeScreen,
});
