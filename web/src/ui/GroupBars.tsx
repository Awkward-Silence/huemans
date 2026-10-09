import type { CSSProperties } from "react";
import type { GroupColor } from "../domain/groupColor.ts";
import { groupVars } from "../theme/index.ts";
import styles from "./GroupBars.module.css";
import { Text } from "./Text.tsx";

type GroupBar = {
  color: GroupColor;
  label: string;
  count: number;
  isYou?: boolean;
};

type GroupBarsProps = {
  groups: GroupBar[];
  /** Marker under the attendee's own group. */
  youLabel: string;
  /** Accessible summary, e.g. "Amber 9, Coral 14, …". */
  label: string;
};

/** Live bar chart of how many people are in each colour. */
function GroupBars({ groups, youLabel, label }: GroupBarsProps) {
  const max = Math.max(1, ...groups.map((group) => group.count));
  return (
    <div className={styles.chart} role="img" aria-label={label}>
      {groups.map((group, index) => (
        <div
          key={group.color}
          className={styles.column}
          style={
            {
              ...groupVars(group.color),
              "--fill": group.count / max,
              "--order": index,
            } as CSSProperties
          }
        >
          <Text as="span" scale="subtitle" tone="groupText" tabular aria-hidden="true">
            {group.count}
          </Text>
          <div className={styles.slot}>
            <div className={styles.bar} />
          </div>
          <Text as="span" scale="caption" tone="muted" className={styles.name} aria-hidden="true">
            {group.label}
          </Text>
          <Text
            as="span"
            scale="eyebrow"
            tone="groupText"
            className={styles.you}
            aria-hidden="true"
          >
            {group.isYou ? youLabel : ""}
          </Text>
        </div>
      ))}
    </div>
  );
}

export { GroupBars };
export type { GroupBar };
