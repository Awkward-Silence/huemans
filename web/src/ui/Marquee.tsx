import type { ReactNode } from "react";
import { cx } from "../lib/cx.ts";
import styles from "./Marquee.module.css";

type MarqueeProps = {
  /** Seconds for one full pass. */
  duration?: number;
  className?: string;
  children: ReactNode;
};

/** Scrolls its content sideways forever, like an LED sign. */
function Marquee({ duration = 12, className, children }: MarqueeProps) {
  return (
    <div className={cx(styles.marquee, className)}>
      <div className={styles.track} style={{ animationDuration: `${duration}s` }}>
        <span className={styles.item}>{children}</span>
        <span className={styles.item} aria-hidden="true">
          {children}
        </span>
      </div>
    </div>
  );
}

export { Marquee };
