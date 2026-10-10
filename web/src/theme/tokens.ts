import { z } from "zod";
import { GROUP_COLORS } from "../domain/groupColor.ts";

/**
 * The shape every theme must fill. Components never read these values
 * directly: the ThemeProvider turns them into CSS custom properties
 * (see cssVars.ts) and stylesheets use `var(--…)`.
 */

const GroupPaletteSchema = z.object({
  /** Fill colour: reveal screen, badge, bars. */
  bg: z.string(),
  /** Text drawn on top of `bg`. */
  ink: z.string(),
  /** Secondary text drawn on top of `bg`. */
  inkSoft: z.string(),
  /** The group colour used as text on the page background. */
  text: z.string(),
});

const TypeStyleSchema = z.object({
  family: z.enum(["display", "body"]),
  size: z.string(),
  lineHeight: z.string(),
  weight: z.string(),
  letterSpacing: z.string(),
  transform: z.enum(["none", "uppercase"]),
});

/** Named type scale. Add a step here, then fill it in every theme. */
const TYPE_SCALE = [
  "badge",
  "displayXL",
  "displayL",
  "headline",
  "title",
  "question",
  "subtitle",
  "stat",
  "cta",
  "lead",
  "bodyL",
  "body",
  "small",
  "caption",
  "eyebrow",
] as const;

type TypeScaleName = (typeof TYPE_SCALE)[number];

const SPACE = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
type SpaceName = (typeof SPACE)[number];

const record = <K extends string, V extends z.ZodType>(keys: readonly K[], value: V) =>
  z.object(Object.fromEntries(keys.map((key) => [key, value])) as Record<K, V>);

const ThemeSchema = z.object({
  /** Browser UI hint for form controls and scrollbars. */
  colorScheme: z.enum(["dark", "light"]),
  color: z.object({
    bg: z.string(),
    surface: z.string(),
    text: z.string(),
    textMuted: z.string(),
    accent: z.string(),
    accentHover: z.string(),
    accentTint: z.string(),
    border: z.string(),
    track: z.string(),
    /** Text on the light pill button. */
    onLight: z.string(),
    /** The light pill button itself. */
    light: z.string(),
    focus: z.string(),
    danger: z.string(),
  }),
  groups: record(GROUP_COLORS, GroupPaletteSchema),
  font: z.object({ display: z.string(), body: z.string() }),
  type: record(TYPE_SCALE, TypeStyleSchema),
  space: record(SPACE, z.string()),
  radius: z.object({ sm: z.string(), md: z.string(), lg: z.string(), pill: z.string() }),
  layout: z.object({
    /** Widest the app gets on a desktop screen. */
    maxWidth: z.string(),
    screenPaddingX: z.string(),
    screenPaddingTop: z.string(),
    screenPaddingBottom: z.string(),
    tapTarget: z.string(),
    ctaHeight: z.string(),
  }),
  motion: z.object({
    duration: z.object({ fast: z.string(), base: z.string(), slow: z.string(), intro: z.string() }),
    ease: z.object({ out: z.string(), outExpo: z.string(), inOut: z.string() }),
    /** Delay between items that animate in one after another. */
    stagger: z.string(),
  }),
});

type Theme = z.infer<typeof ThemeSchema>;

export { SPACE, ThemeSchema, TYPE_SCALE };
export type { SpaceName, Theme, TypeScaleName };
