import { GROUP_COLORS, type GroupColor } from "../../domain/groupColor.ts";
import { TRAIT_TO_GROUP } from "./fixtures/groups.ts";

/**
 * MOCK grouping rules, simple enough to make the demo believable.
 * The real algorithm lives in the api/ Grouping context.
 */

type Lean = { color: GroupColor; percent: number };
type Counts = Record<GroupColor, number>;

/** How far a group may outgrow its runner-up before the tie goes to the smaller one. */
const BALANCE_MARGIN = 3;

const emptyCounts = (): Counts => ({ amber: 0, coral: 0, teal: 0, violet: 0 });

/** Top two groups the traits point to, as percentages of those two. */
function leanFromTraits(traits: string[]): Lean[] {
  const tally = emptyCounts();
  for (const trait of traits) {
    const color = TRAIT_TO_GROUP[trait];
    if (color) tally[color] += 1;
  }
  const ranked = GROUP_COLORS.map((color) => ({ color, votes: tally[color] }))
    .filter((entry) => entry.votes > 0)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 2);
  const sum = ranked.reduce((total, entry) => total + entry.votes, 0);
  if (sum === 0) return [];
  return ranked.map((entry) => ({
    color: entry.color,
    percent: Math.round((entry.votes / sum) * 100),
  }));
}

/** Splits `total` people across groups by weight; the parts always add up to `total`. */
function distribute(total: number, weights: Counts): Counts {
  const weightSum = GROUP_COLORS.reduce((sum, color) => sum + weights[color], 0);
  const counts = emptyCounts();
  let cumulative = 0;
  let assigned = 0;
  for (const color of GROUP_COLORS) {
    cumulative += weights[color];
    const upTo = Math.round((total * cumulative) / weightSum);
    counts[color] = upTo - assigned;
    assigned = upTo;
  }
  return counts;
}

/** Follows the strongest lean unless that would unbalance the room. */
function pickGroup(lean: Lean[], counts: Counts): { color: GroupColor; balanced: boolean } {
  const [first, second] = lean;
  if (!first) {
    const smallest = [...GROUP_COLORS].sort((a, b) => counts[a] - counts[b])[0]!;
    return { color: smallest, balanced: true };
  }
  if (second && counts[first.color] - counts[second.color] > BALANCE_MARGIN) {
    return { color: second.color, balanced: true };
  }
  return { color: first.color, balanced: false };
}

export { distribute, emptyCounts, leanFromTraits, pickGroup };
export type { Counts, Lean };
