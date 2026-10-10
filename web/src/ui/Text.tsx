import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx.ts";
import { typeStyle, type TypeScaleName } from "../theme/index.ts";
import styles from "./Text.module.css";

type TextTone =
  "default" | "muted" | "accent" | "inherit" | "groupText" | "groupInk" | "groupInkSoft" | "danger";

type TextProps = HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "h1" | "h2" | "h3" | "label" | "div" | "strong";
  scale?: TypeScaleName;
  tone?: TextTone;
  align?: "start" | "center";
  /** Max line length in characters. */
  measure?: number;
  /** Fixed-width digits, for counters. */
  tabular?: boolean;
  /** Force capitals regardless of the scale's own transform. */
  uppercase?: boolean;
  htmlFor?: string;
  children: ReactNode;
};

/** All text goes through here so it always sits on the theme's type scale. */
function Text({
  as: Tag = "p",
  scale = "body",
  tone = "default",
  align,
  measure,
  tabular,
  uppercase,
  className,
  style,
  children,
  ...rest
}: TextProps) {
  const merged: CSSProperties = {
    ...typeStyle(scale),
    ...(measure ? { maxWidth: `${measure}ch` } : null),
    ...(uppercase ? { textTransform: "uppercase" } : null),
    ...style,
  };
  return (
    <Tag
      className={cx(
        styles.text,
        styles[tone],
        align === "center" && styles.center,
        tabular && styles.tabular,
        className,
      )}
      style={merged}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type HeadingProps = Omit<TextProps, "as"> & { level?: 1 | 2 | 3 };

function Heading({ level = 1, scale = "title", ...rest }: HeadingProps) {
  return <Text as={`h${level}`} scale={scale} {...rest} />;
}

/** Small uppercase label that sits above a heading or a block. */
function Eyebrow({ tone = "muted", ...rest }: Omit<TextProps, "scale">) {
  return <Text scale="eyebrow" tone={tone} {...rest} />;
}

export { Eyebrow, Heading, Text };
export type { TextProps, TextTone };
