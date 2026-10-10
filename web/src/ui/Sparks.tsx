import type { CSSProperties } from "react";
import { cx } from "../lib/cx.ts";
import styles from "./Sparks.module.css";

const COUNT = 12;

/** Fixed pseudo-random layout, so the burst looks the same on every render. */
const SPARKS = (() => {
  let seed = 90_210;
  const random = () => {
    seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
    return seed / 2_147_483_648;
  };
  return Array.from({ length: COUNT }, (_, index) => {
    const angle = (index / COUNT) * Math.PI * 2;
    const distance = 90 + random() * 80;
    return {
      size: 5 + Math.round(random() * 5),
      round: index % 2 === 0,
      light: index % 3 === 0,
      dx: Math.round(Math.cos(angle) * distance),
      dy: Math.round(Math.sin(angle) * distance),
      delay: random() * 1.2,
    };
  });
})();

/** A small looping burst of confetti around its centre. Decorative; gone with reduced motion. */
function Sparks({ className }: { className?: string }) {
  return (
    <span className={cx(styles.origin, className)} aria-hidden="true">
      {SPARKS.map((spark, index) => (
        <span
          key={index}
          className={cx(styles.spark, spark.round && styles.round, spark.light && styles.light)}
          style={
            {
              width: spark.size,
              height: spark.size,
              "--dx": `${spark.dx}px`,
              "--dy": `${spark.dy}px`,
              animationDelay: `${spark.delay.toFixed(2)}s`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

export { Sparks };
