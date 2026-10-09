/** Joins class names, skipping falsy ones. */
function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export { cx };
