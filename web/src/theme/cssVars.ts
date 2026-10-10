import type { CSSProperties } from "react";
import type { GroupColor } from "../domain/groupColor.ts";
import type { SpaceName, Theme, TypeScaleName } from "./tokens.ts";

type CssVars = Record<`--${string}`, string>;

const kebab = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/**
 * Flattens a theme into CSS custom properties, joining nested keys with "-":
 * `color.textMuted` -> `--color-text-muted`, `groups.teal.bg` -> `--group-teal-bg`.
 */
function themeToCssVars(theme: Theme): CssVars {
  const vars: CssVars = {};
  const walk = (prefix: string, value: unknown) => {
    if (typeof value === "string") {
      vars[`--${prefix}`] = value;
      return;
    }
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      walk(prefix ? `${prefix}-${kebab(key)}` : kebab(key), child);
    }
  };
  const { color, space, radius, layout, motion, groups, type, font } = theme;
  walk("", { color, space, radius, layout, motion });
  walk("group", groups);
  walk("font", font);
  // Type styles point at the font variables, so a font swap reaches every scale.
  for (const [name, style] of Object.entries(type)) {
    const { family, ...props } = style;
    walk(`type-${kebab(name)}`, props);
    vars[`--type-${kebab(name)}-family`] = `var(--font-${family})`;
  }
  return vars;
}

const typeVar = (scale: TypeScaleName, prop: string) => `var(--type-${kebab(scale)}-${prop})`;

/** Inline style that applies one step of the type scale. */
function typeStyle(scale: TypeScaleName): CSSProperties {
  return {
    fontFamily: typeVar(scale, "family"),
    fontSize: typeVar(scale, "size"),
    lineHeight: typeVar(scale, "line-height"),
    fontWeight: typeVar(scale, "weight"),
    letterSpacing: typeVar(scale, "letter-spacing"),
    textTransform: typeVar(scale, "transform") as CSSProperties["textTransform"],
  };
}

const spaceVar = (space: SpaceName) => `var(--space-${space})`;

/**
 * Points the generic `--group-*` variables at one group's palette, so any
 * subtree can be drawn "in the attendee's colour" without knowing which it is.
 */
function groupVars(color: GroupColor): CSSProperties {
  return {
    "--group-bg": `var(--group-${color}-bg)`,
    "--group-ink": `var(--group-${color}-ink)`,
    "--group-ink-soft": `var(--group-${color}-ink-soft)`,
    "--group-text": `var(--group-${color}-text)`,
  } as CSSProperties;
}

export { groupVars, spaceVar, themeToCssVars, typeStyle };
export type { CssVars };
