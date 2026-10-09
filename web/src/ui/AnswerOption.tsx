import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx.ts";
import styles from "./AnswerOption.module.css";

type AnswerOptionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Short key shown in the badge, e.g. "A". */
  keyLabel: string;
  selected?: boolean;
  children: ReactNode;
};

/** One tappable multiple-choice answer. */
function AnswerOption({ keyLabel, selected, className, children, ...rest }: AnswerOptionProps) {
  return (
    <button
      type="button"
      className={cx(styles.option, selected && styles.selected, className)}
      aria-pressed={selected}
      {...rest}
    >
      <span className={styles.key} aria-hidden="true">
        {keyLabel}
      </span>
      <span className={styles.label}>{children}</span>
    </button>
  );
}

export { AnswerOption };
