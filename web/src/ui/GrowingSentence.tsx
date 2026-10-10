import { useLayoutEffect, useRef } from "react";
import { cx } from "../lib/cx.ts";
import styles from "./GrowingSentence.module.css";
import { Text } from "./Text.tsx";

type GrowingSentenceProps = {
  words: readonly string[];
  /** One type step smaller, for long words or a long sentence. */
  compact?: boolean;
  /** Blinking caret after the last word, while the sentence is still open. */
  caret?: boolean;
  /** Words from this index on are drawn in the accent colour. */
  highlightFrom?: number;
  /**
   * Where the newest word was tapped (its label's rect on screen). The word
   * flies from there into place. Pass a new rect for every new word.
   */
  flyFrom?: DOMRect | null;
  className?: string;
};

const FLIGHT_MS = 320;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** A big sentence that grows one word at a time. */
function GrowingSentence({
  words,
  compact,
  caret,
  highlightFrom = words.length,
  flyFrom,
  className,
}: GrowingSentenceProps) {
  const lastWord = useRef<HTMLSpanElement>(null);

  // FLIP: start the new word where the tapped card's label was, then let it settle.
  useLayoutEffect(() => {
    const element = lastWord.current;
    if (!flyFrom || !element || prefersReducedMotion() || !element.animate) return;
    const to = element.getBoundingClientRect();
    if (to.height === 0) return;
    const dx = flyFrom.left + flyFrom.width / 2 - (to.left + to.width / 2);
    const dy = flyFrom.top + flyFrom.height / 2 - (to.top + to.height / 2);
    const scale = flyFrom.height / to.height;
    element.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.55 },
        { transform: "translate(0, 0) scale(1.06)", opacity: 1, offset: 0.7 },
        { transform: "none", opacity: 1 },
      ],
      { duration: FLIGHT_MS, easing: "cubic-bezier(0.2, 0.9, 0.25, 1)" },
    );
  }, [flyFrom]);

  return (
    <Text
      scale={compact ? "title" : "headline"}
      className={cx(styles.sentence, className)}
      aria-live="polite"
    >
      {words.map((word, index) => (
        <span key={index}>
          {index > 0 && " "}
          <span
            ref={index === words.length - 1 ? lastWord : undefined}
            className={cx(styles.word, index >= highlightFrom && styles.highlight)}
          >
            {word}
          </span>
        </span>
      ))}
      {caret && <span className={styles.caret} aria-hidden="true" />}
    </Text>
  );
}

export { GrowingSentence };
