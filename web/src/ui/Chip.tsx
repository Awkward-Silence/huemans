import type { ReactNode } from "react";
import { cx } from "../lib/cx.ts";
import styles from "./Chip.module.css";

type ChipProps = {
  /** "accent": tinted label (quiz theme). "outline": pill drawn in the current text colour (traits). */
  tone?: "accent" | "outline";
  children: ReactNode;
};

function Chip({ tone = "outline", children }: ChipProps) {
  return <span className={cx(styles.chip, styles[tone])}>{children}</span>;
}

export { Chip };
