export function parseLimit(raw: string): number {
  const value = parseInt(raw);
  if (value > 100) {
    return 100;
  }
  return value;
}

export function buildUrl(base: string, path: string, token: string): string {
  return `${base}/${path}?token=${token}`;
}
