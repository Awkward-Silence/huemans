import type { CSSProperties } from "react";
import { cx } from "../lib/cx.ts";
import styles from "./ProgressBar.module.css";

type ProgressBarProps = {
  /** 0 to 1. */
  value: number;
  tone?: "accent" | "text" | "group";
  /** "flush" spans edge to edge with square ends (the quiz timer). */
  shape?: "flush" | "rounded";
  /** Accessible name. Without it the bar is decorative. */
  label?: string;
  className?: string;
};

function ProgressBar({
  value,
  tone = "accent",
  shape = "rounded",
  label,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const a11y = label
    ? {
        role: "progressbar",
        "aria-label": label,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": Math.round(clamped * 100),
      }
    : { "aria-hidden": true };
  return (
    <div className={cx(styles.track, styles[shape], className)} {...a11y}>
      <div
        className={cx(styles.fill, styles[tone])}
        style={{ "--progress": clamped } as CSSProperties}
      />
    </div>
  );
}

export { ProgressBar };
