import { SentenceTraits } from '@Huemans/Participation/Domain/ValueObject/SentenceTraits';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

function weightsOf(traits: SentenceTraits): Record<string, number> {
  return Object.fromEntries(traits.all().map(({ trait, weight }) => [trait.value, weight.value]));
}

describe('SentenceTraits', () => {
  it('testWeighsOneWholeAnswerInTotal', () => {
    const traits = SentenceTraits.fromScores([
      [new Trait('romantic'), 0.6],
      [new Trait('dramatic'), 0.2],
    ]);

    const weights = weightsOf(traits);
    expect(weights.romantic).toBeCloseTo(0.75);
    expect(weights.dramatic).toBeCloseTo(0.25);
  });

  it('testDropsNoiseBeforeRescaling', () => {
    const traits = SentenceTraits.fromScores([
      [new Trait('romantic'), 0.97],
      [new Trait('curious'), 0.02],
      [new Trait('stubborn'), 0.01],
    ]);

    expect(weightsOf(traits)).toEqual({ romantic: 1 });
  });

  it('testAllZeroScoresAddNothing', () => {
    expect(SentenceTraits.fromScores([[new Trait('romantic'), 0]]).all()).toEqual([]);
  });

  it('testNoneAddsNothing', () => {
    expect(SentenceTraits.none().all()).toEqual([]);
  });

  it('testRejectsNegativeScores', () => {
    expect(() => SentenceTraits.fromScores([[new Trait('romantic'), -1]])).toThrow(InvalidArgumentError);
  });
});
