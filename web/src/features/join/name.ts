import { z } from "zod";
import { copy } from "../../content/index.ts";

/** Longest name that still fits the LED badge on a phone. */
const NAME_MAX_LENGTH = 12;

const NameSchema = z
  .string()
  .trim()
  .min(1, copy.name.errors.empty)
  .max(NAME_MAX_LENGTH, copy.name.errors.tooLong(NAME_MAX_LENGTH));

export { NAME_MAX_LENGTH, NameSchema };
