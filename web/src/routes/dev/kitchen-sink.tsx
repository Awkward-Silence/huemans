import { createFileRoute, notFound } from "@tanstack/react-router";
import { KitchenSink } from "../../dev/KitchenSink.tsx";

/** Every ui/ component in every variant, for theming and review. Dev builds only. */
export const Route = createFileRoute("/dev/kitchen-sink")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: KitchenSink,
});
