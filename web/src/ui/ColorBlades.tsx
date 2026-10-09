import type { CSSProperties } from "react";
import { GROUP_COLORS } from "../domain/groupColor.ts";
import styles from "./ColorBlades.module.css";

type ColorBladesProps = {
  /** Height of each blade in %, one per group colour. */
  heights?: readonly number[];
};

/** Decorative: one vertical blade per group colour, growing up from the bottom. */
function ColorBlades({ heights = [62, 86, 44, 72] }: ColorBladesProps) {
  return (
    <div className={styles.blades} aria-hidden="true">
      {GROUP_COLORS.map((color, index) => (
        <div
          key={color}
          className={styles.blade}
          style={
            {
              "--blade-color": `var(--group-${color}-bg)`,
              "--blade-height": `${heights[index % heights.length]}%`,
              "--order": index,
            } as CSSProperties
          }
        />
      ))}
      <div className={styles.fade} />
    </div>
  );
}

export { ColorBlades };
