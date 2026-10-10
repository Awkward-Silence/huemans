import { describe, expect, it } from "vitest";
import { groupVars, themeToCssVars } from "./cssVars.ts";
import { ThemeSchema } from "./tokens.ts";
import { themes } from "./themes/index.ts";

describe("themeToCssVars", () => {
  const vars = themeToCssVars(themes.default);

  it("flattens nested tokens into kebab-case variables", () => {
    expect(vars["--color-bg"]).toBe("#121016");
    expect(vars["--color-text-muted"]).toBe("#A6A0B0");
    expect(vars["--group-teal-bg"]).toBe("#0E8176");
    expect(vars["--group-violet-ink-soft"]).toBe("rgba(255, 255, 255, 0.86)");
    expect(vars["--layout-max-width"]).toBe("480px");
    expect(vars["--motion-ease-out-expo"]).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
  });

  it("points type styles at the font variables", () => {
    expect(vars["--type-display-xl-size"]).toBe("92px");
    expect(vars["--type-display-xl-family"]).toBe("var(--font-display)");
    expect(vars["--type-body-family"]).toBe("var(--font-body)");
  });

  it("does not leak non-CSS settings", () => {
    expect(Object.keys(vars).some((key) => key.includes("scheme"))).toBe(false);
  });
});

describe("themes", () => {
  it.each(Object.entries(themes))("%s fills every token", (_name, theme) => {
    expect(ThemeSchema.safeParse(theme).success).toBe(true);
  });
});

describe("groupVars", () => {
  it("aliases the generic group variables to one group", () => {
    expect(groupVars("coral")).toMatchObject({
      "--group-bg": "var(--group-coral-bg)",
      "--group-text": "var(--group-coral-text)",
    });
  });
});
