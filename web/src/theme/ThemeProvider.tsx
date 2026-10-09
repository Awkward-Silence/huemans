import { useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { config } from "../config.ts";
import { themeToCssVars } from "./cssVars.ts";
import { ThemeContext } from "./themeContext.ts";
import { isThemeName, themes, type ThemeName } from "./themes/index.ts";

/** `?theme=daylight` wins, then the configured default, then "default". */
function initialThemeName(): ThemeName {
  const fromUrl = new URLSearchParams(window.location.search).get("theme");
  if (isThemeName(fromUrl)) return fromUrl;
  if (isThemeName(config.defaultTheme)) return config.defaultTheme;
  return "default";
}

/** Writes the active theme as CSS custom properties on <html>. */
function ThemeProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<ThemeName>(initialThemeName);
  const theme = themes[name];

  useLayoutEffect(() => {
    const root = document.documentElement;
    const vars = themeToCssVars(theme);
    for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);
    root.style.colorScheme = theme.colorScheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.color.bg);
    return () => {
      for (const key of Object.keys(vars)) root.style.removeProperty(key);
    };
  }, [theme]);

  const value = useMemo(() => ({ name, theme, setTheme: setName }), [name, theme]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export { ThemeProvider };
