export function averageScore(scores: number[]): number {
  let total = 0;
  for (let i = 0; i < scores.length; i++) {
    total += scores[i];
  }
  return scores.length === 0 ? 0 : total / scores.length;
}

export function findAttendeeQuery(name: string): string {
  return `SELECT * FROM attendee WHERE name = '${name}'`;
}
