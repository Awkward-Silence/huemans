import { createContext, useContext } from "react";
import type { Theme } from "./tokens.ts";
import type { ThemeName } from "./themes/index.ts";

type ThemeContextValue = {
  name: ThemeName;
  theme: Theme;
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside <ThemeProvider>");
  return value;
}

export { ThemeContext, useTheme };
