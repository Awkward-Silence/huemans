import { cx } from "../lib/cx.ts";
import styles from "./PulseDot.module.css";

type PulseDotProps = {
  /** "accent" for before the reveal, when no group colour may show. */
  tone?: "group" | "accent";
};

/** Small pulsing dot: "this is live". */
function PulseDot({ tone = "group" }: PulseDotProps) {
  return <span className={cx(styles.dot, styles[tone])} aria-hidden="true" />;
}

export { PulseDot };
