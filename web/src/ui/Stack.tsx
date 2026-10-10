import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx.ts";
import { spaceVar, type SpaceName } from "../theme/index.ts";
import styles from "./Stack.module.css";

type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: "column" | "row";
  gap?: SpaceName;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
  /** Push this stack to the bottom of a column (margin-top: auto). */
  pushEnd?: boolean;
  /** Take the remaining space in a column. */
  grow?: boolean;
  children: ReactNode;
};

/** Flex layout with theme spacing. Use it instead of ad-hoc flex CSS. */
function Stack({
  direction = "column",
  gap = "md",
  align,
  justify,
  wrap,
  pushEnd,
  grow,
  className,
  style,
  children,
  ...rest
}: StackProps) {
  const merged: CSSProperties = {
    flexDirection: direction,
    gap: spaceVar(gap),
    alignItems: align && (align === "start" || align === "end" ? `flex-${align}` : align),
    justifyContent:
      justify &&
      (justify === "between"
        ? "space-between"
        : justify === "center"
          ? "center"
          : `flex-${justify}`),
    ...style,
  };
  return (
    <div
      className={cx(
        styles.stack,
        wrap && styles.wrap,
        pushEnd && styles.pushEnd,
        grow && styles.grow,
        className,
      )}
      style={merged}
      {...rest}
    >
      {children}
    </div>
  );
}

export { Stack };
export type { StackProps };
