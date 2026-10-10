import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "./useCountdown.ts";
import { formatClock } from "./format.ts";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-10T20:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("counts down to the deadline and stops at zero", () => {
    const endsAt = Date.now() + 20_000;
    const { result } = renderHook(() => useCountdown(endsAt, 20_000));
    expect(result.current.secondsLeft).toBe(20);
    expect(result.current.fractionLeft).toBe(1);

    act(() => vi.advanceTimersByTime(5_000));
    expect(result.current.secondsLeft).toBe(15);
    expect(result.current.fractionLeft).toBeCloseTo(0.75);

    act(() => vi.advanceTimersByTime(30_000));
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isOver).toBe(true);
  });

  it("is idle without a deadline", () => {
    const { result } = renderHook(() => useCountdown(undefined));
    expect(result.current).toMatchObject({ secondsLeft: 0, isOver: false });
  });
});

describe("formatClock", () => {
  it("formats minutes and seconds", () => {
    expect(formatClock(108)).toBe("1:48");
    expect(formatClock(5)).toBe("0:05");
    expect(formatClock(-3)).toBe("0:00");
  });
});
