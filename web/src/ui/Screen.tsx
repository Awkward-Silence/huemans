import type { CSSProperties, ReactNode } from "react";
import type { GroupColor } from "../domain/groupColor.ts";
import { cx } from "../lib/cx.ts";
import { groupVars } from "../theme/index.ts";
import styles from "./Screen.module.css";

type ScreenProps = {
  /** "group" paints the whole screen in the attendee's colour. */
  tone?: "default" | "group";
  /** Scopes the `--group-*` variables to this group's palette. */
  group?: GroupColor;
  /** Decorative layer drawn behind the content, edge to edge (ColorBlades, FloodReveal…). */
  backdrop?: ReactNode;
  padding?: "default" | "compact";
  align?: "start" | "center";
  /** Where the content sits when it is shorter than the screen. */
  justify?: "start" | "end";
  /** Drop the max width, e.g. for a phone turned sideways. */
  fullBleed?: boolean;
  className?: string;
  children: ReactNode;
};

/** One phone screen: full height, safe-area aware, centred on wide displays. */
function Screen({
  tone = "default",
  group,
  backdrop,
  padding = "default",
  align = "start",
  justify = "start",
  fullBleed,
  className,
  children,
}: ScreenProps) {
  const style: CSSProperties | undefined = group ? groupVars(group) : undefined;
  return (
    <main className={cx(styles.screen, styles[tone])} style={style}>
      <div className={cx(styles.inner, styles[`pad-${padding}`], fullBleed && styles.fullBleed)}>
        {backdrop}
        <div
          className={cx(
            styles.content,
            align === "center" && styles.center,
            justify === "end" && styles.end,
            className,
          )}
        >
          {children}
        </div>
      </div>
    </main>
  );
}

export { Screen };
export type { ScreenProps };
