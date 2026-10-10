import { cx } from "../lib/cx.ts";
import styles from "./ProgressDots.module.css";

type ProgressDotsProps = {
  total: number;
  filled: number;
  className?: string;
};

/** A row of small dots, `filled` of them lit. The newest one pops in. Decorative. */
function ProgressDots({ total, filled, className }: ProgressDotsProps) {
  return (
    <span className={cx(styles.dots, className)} aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cx(
            styles.dot,
            index < filled && styles.filled,
            index === filled - 1 && styles.newest,
          )}
        />
      ))}
    </span>
  );
}

export { ProgressDots };
