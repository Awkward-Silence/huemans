import type { CSSProperties } from "react";
import { cx } from "../lib/cx.ts";
import { typeStyle, type TypeScaleName } from "../theme/index.ts";
import styles from "./FitText.module.css";

type FitTextProps = {
  /** The text; its length decides how far the size shrinks. */
  text: string;
  /** Largest size, from the type scale. */
  scale: TypeScaleName;
  /** Average glyph width as a fraction of the font size. */
  glyphWidth?: number;
  as?: "p" | "h1" | "span";
  className?: string;
};

/**
 * Shrinks one line of display text so it always fits its container's width.
 * Pure CSS (container query units), no measuring.
 */
function FitText({ text, scale, glyphWidth = 0.66, as: Tag = "p", className }: FitTextProps) {
  const base = typeStyle(scale);
  return (
    <div className={styles.container}>
      <Tag
        className={cx(styles.text, className)}
        style={
          {
            ...base,
            "--fit-max": base.fontSize,
            "--fit-chars": Math.max(1, text.length),
            "--fit-glyph": glyphWidth,
            fontSize: undefined,
          } as CSSProperties
        }
      >
        {text}
      </Tag>
    </div>
  );
}

export { FitText };
