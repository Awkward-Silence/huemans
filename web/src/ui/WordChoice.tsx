import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { cx } from "../lib/cx.ts";
import styles from "./WordChoice.module.css";
import { Text } from "./Text.tsx";

/** Past this many letters a word drops a type size so it fits the card. */
const LONG_WORD = 12;

type WordChoiceProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  word: string;
  /** Position in its row; each one rises a beat after the previous. */
  step?: number;
};

/** One big tappable word card (the sentence builder). */
function WordChoice({ word, step = 0, className, style, ...rest }: WordChoiceProps) {
  return (
    <button
      type="button"
      className={cx(styles.choice, className)}
      style={{ "--choice-step": step, ...style } as CSSProperties}
      {...rest}
    >
      <Text as="span" scale={word.length > LONG_WORD ? "cta" : "subtitle"} tone="inherit">
        {word}
      </Text>
    </button>
  );
}

/** Stand-in card while words load: a dim outline with a slow breathing pulse. */
function WordChoiceSkeleton({ step = 0, width = 50 }: { step?: number; width?: number }) {
  return (
    <div
      className={styles.skeleton}
      style={{ "--choice-step": step } as CSSProperties}
      aria-hidden="true"
    >
      <span className={styles.bone} style={{ width: `${width}%` }} />
    </div>
  );
}

export { WordChoice, WordChoiceSkeleton };
