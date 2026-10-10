import type { CSSProperties } from "react";
import { GROUP_COLORS } from "../domain/groupColor.ts";
import styles from "./ColorLoader.module.css";

/** Decorative: one dot per group colour, bouncing in a wave, "still working on it". */
function ColorLoader() {
  return (
    <div className={styles.loader} aria-hidden="true">
      {GROUP_COLORS.map((color, index) => (
        <span
          key={color}
          className={styles.dot}
          style={{ "--dot-color": `var(--group-${color}-bg)`, "--order": index } as CSSProperties}
        />
      ))}
    </div>
  );
}

export { ColorLoader };
