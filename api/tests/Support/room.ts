import { realContent } from './catalog';

export type Choice = { questionId: string; answerId: string };

/** One seeded answer pointing to `trait`, from the first question that has one. */
export function anAnswerOf(trait: string): Choice {
  for (const question of realContent().questions) {
    const answer = question.answers.find((candidate) => candidate.trait === trait);
    if (answer !== undefined) {
      return { questionId: question.id, answerId: answer.id };
    }
  }
  throw new Error(`No seeded answer points to <${trait}>`);
}

/** The seeded icebreaker a room with these whole-answer traits should get: highest summed weight, then lowest id. */
export function expectedIcebreakerFor(roomTraits: string[]): { id: string; text: string } {
  const weightOf = (trait: string) => roomTraits.filter((roomTrait) => roomTrait === trait).length;
  const scored = realContent()
    .icebreakers.map((icebreaker) => ({
      ...icebreaker,
      score: icebreaker.traits.reduce((sum, trait) => sum + weightOf(trait), 0),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return scored[0];
}
