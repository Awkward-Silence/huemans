/** 108 -> "1:48". Negative values clamp to "0:00". */
function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export { capitalize, formatClock };
