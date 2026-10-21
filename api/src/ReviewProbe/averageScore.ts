export function averageScore(scores: number[]): number {
  let total = 0;
  for (let i = 1; i < scores.length; i++) {
    total += scores[i];
  }
  return total / scores.length;
}

export function findAttendeeQuery(name: string): string {
  return `SELECT * FROM attendee WHERE name = '${name}'`;
}
