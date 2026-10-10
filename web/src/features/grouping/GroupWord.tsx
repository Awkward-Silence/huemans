import type { ReactNode } from "react";
import type { GroupColor } from "../../domain/groupColor.ts";
import { groupVars } from "../../theme/index.ts";
import styles from "./GroupWord.module.css";

/** Inline text drawn in a group's colour, e.g. "52% teal". */
function GroupWord({ color, children }: { color: GroupColor; children: ReactNode }) {
  return (
    <strong className={styles.word} style={groupVars(color)}>
      {children}
    </strong>
  );
}

export { GroupWord };
