import { ThemeSchema, type Theme } from "../tokens.ts";
import { daylightTheme } from "./daylight.ts";
import { defaultTheme } from "./default.ts";

/** Every selectable theme. Add a file in this folder and register it here. */
const themes = {
  default: defaultTheme,
  daylight: daylightTheme,
} satisfies Record<string, Theme>;

type ThemeName = keyof typeof themes;

const isThemeName = (name: string | null | undefined): name is ThemeName =>
  !!name && Object.hasOwn(themes, name);

if (import.meta.env.DEV) {
  // Catch a half-filled theme early instead of rendering with missing variables.
  for (const [name, theme] of Object.entries(themes)) {
    const result = ThemeSchema.safeParse(theme);
    if (!result.success) console.error(`Theme "${name}" is invalid`, result.error.issues);
  }
}

export { isThemeName, themes };
export type { ThemeName };
