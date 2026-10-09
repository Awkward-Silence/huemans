import styles from "./FloodReveal.module.css";

/**
 * Decorative backdrop: the group colour spreads as a circle from just above
 * the centre until it fills the screen. Use as a Screen `backdrop`.
 */
function FloodReveal() {
  return <div className={styles.flood} aria-hidden="true" />;
}

export { FloodReveal };
