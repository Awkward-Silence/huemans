import type { HTMLAttributes } from "react";
import styles from "./VisuallyHidden.module.css";

/** Readable by screen readers, invisible on screen. */
function VisuallyHidden(props: HTMLAttributes<HTMLSpanElement>) {
  return <span className={styles.hidden} {...props} />;
}

export { VisuallyHidden };
