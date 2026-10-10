import { useState } from "react";
import { formatClock } from "../lib/format.ts";
import type { TypeScaleName } from "../theme/index.ts";
import { Stack } from "./Stack.tsx";
import { Text, type TextTone } from "./Text.tsx";
import { VisuallyHidden } from "./VisuallyHidden.tsx";

type CountdownProps = {
  seconds: number;
  /** "seconds": 17, "clock": 1:48. */
  format?: "seconds" | "clock";
  /** Small unit after the number, e.g. "s". */
  unit?: string;
  scale?: TypeScaleName;
  tone?: TextTone;
  /** What screen readers hear. Announced every `announceEvery` seconds, not every tick. */
  srLabel: (seconds: number) => string;
  announceEvery?: number;
};

/** A big ticking number. Only the visible number updates every second. */
function Countdown({
  seconds,
  format = "seconds",
  unit,
  scale = "subtitle",
  tone = "accent",
  srLabel,
  announceEvery = 10,
}: CountdownProps) {
  const [announced, setAnnounced] = useState(seconds);
  if (seconds !== announced && (seconds % announceEvery === 0 || seconds === 0)) {
    setAnnounced(seconds);
  }
  return (
    <Stack direction="row" gap="2xs" align="baseline">
      <Text as="span" scale={scale} tone={tone} tabular aria-hidden="true">
        {format === "clock" ? formatClock(seconds) : seconds}
      </Text>
      {unit && (
        <Text as="span" scale="caption" tone="muted" aria-hidden="true">
          {unit}
        </Text>
      )}
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {srLabel(announced)}
      </VisuallyHidden>
    </Stack>
  );
}

export { Countdown };
