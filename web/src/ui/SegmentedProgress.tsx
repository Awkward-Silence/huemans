import type { CSSProperties } from "react";
import { GROUP_COLORS } from "../domain/groupColor.ts";
import { cx } from "../lib/cx.ts";
import styles from "./SegmentedProgress.module.css";

type SegmentedProgressProps = {
  total: number;
  /** Zero-based index of the current segment. */
  current: number;
  /**
   * "mono": done and current segments use the text colour (step indicator).
   * "groups": done segments cycle through the group colours, current is the accent (quiz).
   */
  palette?: "mono" | "groups";
  size?: "sm" | "md";
  /** Accessible description, e.g. "Step 1 of 3". */
  label?: string;
  className?: string;
};

function SegmentedProgress({
  total,
  current,
  palette = "mono",
  size = "md",
  label,
  className,
}: SegmentedProgressProps) {
  return (
    <div
      className={cx(styles.segments, styles[size], className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {Array.from({ length: total }, (_, index) => {
        const state = index < current ? "done" : index === current ? "current" : "todo";
        const groupFill =
          palette === "groups" && state === "done"
            ? ({
                "--segment-fill": `var(--group-${GROUP_COLORS[index % GROUP_COLORS.length]}-bg)`,
              } as CSSProperties)
            : undefined;
        return (
          <span
            key={index}
            className={cx(styles.segment, styles[`${palette}-${state}`])}
            style={groupFill}
          />
        );
      })}
    </div>
  );
}

export { SegmentedProgress };
