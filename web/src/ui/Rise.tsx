import type { CSSProperties, ReactNode } from "react";
import { cx } from "../lib/cx.ts";
import styles from "./Rise.module.css";

type RiseProps = {
  /** Position in the sequence; each step waits one `--motion-stagger` longer. */
  step?: number;
  /** Extra delay before the sequence starts, as a CSS time ("1.9s"). */
  after?: string;
  className?: string;
  children: ReactNode;
};

/** Fades its content up into place. Wrap siblings with increasing `step` to stagger them. */
function Rise({ step = 0, after = "0s", className, children }: RiseProps) {
  return (
    <div
      className={cx(styles.rise, className)}
      style={{ "--rise-step": step, "--rise-after": after } as CSSProperties}
    >
      {children}
    </div>
  );
}

export { Rise };
