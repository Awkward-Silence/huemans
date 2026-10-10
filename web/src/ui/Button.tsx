import { createLink } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cx } from "../lib/cx.ts";
import styles from "./Button.module.css";
import { Icon, type IconName } from "./Icon.tsx";

type ButtonVariant =
  /** Light pill on the dark page. */
  | "light"
  /** Filled with the group colour. */
  | "group"
  /** Group ink on a group-coloured screen. */
  | "groupInk"
  /** Text-only, for secondary actions. */
  | "ghost";

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  /** Trailing icon. */
  icon?: IconName;
  /** Full width (default). */
  block?: boolean;
  /** Gentle bob to draw the eye. */
  nudge?: boolean;
};

const buttonClass = (
  { variant = "light", size = "lg", block = true, nudge }: ButtonStyleProps,
  className?: string,
) =>
  cx(
    styles.button,
    styles[variant],
    styles[size],
    block && styles.block,
    nudge && styles.nudge,
    className,
  );

function Content({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <>
      {children}
      {icon && <Icon name={icon} />}
    </>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps & {
    /** Disables the button and marks it busy; pass the busy label as children. */
    loading?: boolean;
  };

function Button({
  variant,
  size,
  icon,
  block,
  nudge,
  loading,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block, nudge }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Content icon={loading ? undefined : icon}>{children}</Content>
    </button>
  );
}

type ButtonAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonStyleProps & { ref?: Ref<HTMLAnchorElement> };

function ButtonAnchor({
  variant,
  size,
  icon,
  block,
  nudge,
  className,
  children,
  ...rest
}: ButtonAnchorProps) {
  return (
    <a className={buttonClass({ variant, size, block, nudge }, className)} {...rest}>
      <Content icon={icon}>{children}</Content>
    </a>
  );
}

/** A router link that looks like a Button. Takes the same `to`/`params` as <Link>. */
const ButtonLink = createLink(ButtonAnchor);

export { Button, ButtonLink };
export type { ButtonProps, ButtonVariant };
