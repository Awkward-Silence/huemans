import styles from "./PulseDot.module.css";

/** Small pulsing dot in the group colour: "this is live". */
function PulseDot() {
  return <span className={styles.dot} aria-hidden="true" />;
}

export { PulseDot };
