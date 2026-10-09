import type { CSSProperties } from "react";
import { GROUP_COLORS } from "../domain/groupColor.ts";
import styles from "./ColorOrbs.module.css";

/** Where each orb sits inside the cluster, in % of its box. */
const LAYOUT = [
  { top: 0, left: 12, size: 59 },
  { top: 18, left: 38, size: 56 },
  { top: 41, left: 6, size: 56 },
  { top: 44, left: 41, size: 53 },
];

/** Decorative: blurred group colours breathing, "the colours are still mixed". */
function ColorOrbs() {
  return (
    <div className={styles.cluster} aria-hidden="true">
      {GROUP_COLORS.map((color, index) => {
        const spot = LAYOUT[index % LAYOUT.length]!;
        return (
          <div
            key={color}
            className={styles.orb}
            style={
              {
                "--orb-color": `var(--group-${color}-bg)`,
                top: `${spot.top}%`,
                left: `${spot.left}%`,
                width: `${spot.size}%`,
                "--order": index,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

export { ColorOrbs };
