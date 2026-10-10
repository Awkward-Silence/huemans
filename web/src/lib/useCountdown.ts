import { useEffect, useState } from "react";

type Countdown = {
  /** Milliseconds left, never below 0. */
  remainingMs: number;
  /** Whole seconds left, rounded up so "1" shows until the very end. */
  secondsLeft: number;
  /** 1 at the start, 0 at the end. Needs `durationMs`. */
  fractionLeft: number;
  isOver: boolean;
};

const TICK_MS = 250;

/** Counts down to `endsAt` (epoch ms). Pass `durationMs` to get `fractionLeft`. */
function useCountdown(endsAt: number | undefined, durationMs?: number): Countdown {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === undefined) return;
    const id = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) window.clearInterval(id);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const remainingMs = endsAt === undefined ? 0 : Math.max(0, endsAt - now);
  return {
    remainingMs,
    secondsLeft: Math.ceil(remainingMs / 1000),
    fractionLeft: durationMs ? Math.min(1, remainingMs / durationMs) : 0,
    isOver: endsAt !== undefined && remainingMs === 0,
  };
}

export { useCountdown };
export type { Countdown };
