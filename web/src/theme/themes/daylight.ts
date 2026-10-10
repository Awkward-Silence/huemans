import type { Theme } from "../tokens.ts";
import { defaultTheme } from "./default.ts";

/**
 * "Daylight": a light variant for bright venues. It reuses the default
 * type, spacing and motion, and only swaps colours.
 */
const daylightTheme: Theme = {
  ...defaultTheme,
  colorScheme: "light",
  color: {
    bg: "#F6F3EF",
    surface: "#FFFFFF",
    text: "#141216",
    textMuted: "#5E5866",
    accent: "#A8620A",
    accentHover: "#7F4906",
    accentTint: "rgba(168, 98, 10, 0.12)",
    border: "rgba(20, 18, 22, 0.16)",
    track: "rgba(20, 18, 22, 0.1)",
    onLight: "#F6F3EF",
    light: "#141216",
    focus: "#4A3DC9",
    danger: "#B3261E",
  },
  groups: {
    amber: { bg: "#F5B13F", ink: "#1A1410", inkSoft: "rgba(26, 20, 16, 0.74)", text: "#9A5B00" },
    coral: { bg: "#EE5E7B", ink: "#2B0A12", inkSoft: "rgba(43, 10, 18, 0.76)", text: "#B4234A" },
    teal: { bg: "#0E8176", ink: "#FFFFFF", inkSoft: "rgba(255, 255, 255, 0.86)", text: "#0B6B62" },
    violet: {
      bg: "#4A3DC9",
      ink: "#FFFFFF",
      inkSoft: "rgba(255, 255, 255, 0.86)",
      text: "#4A3DC9",
    },
  },
};

export { daylightTheme };
