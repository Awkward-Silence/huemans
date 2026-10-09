import { describe, expect, it } from "vitest";
import { NAME_MAX_LENGTH, NameSchema } from "./name.ts";

describe("NameSchema", () => {
  it("trims the name", () => {
    expect(NameSchema.parse("  Ana ")).toBe("Ana");
  });

  it("rejects an empty or blank name", () => {
    expect(NameSchema.safeParse("").success).toBe(false);
    expect(NameSchema.safeParse("   ").success).toBe(false);
  });

  it(`allows up to ${NAME_MAX_LENGTH} characters`, () => {
    expect(NameSchema.safeParse("x".repeat(NAME_MAX_LENGTH)).success).toBe(true);
    expect(NameSchema.safeParse("x".repeat(NAME_MAX_LENGTH + 1)).success).toBe(false);
  });
});
