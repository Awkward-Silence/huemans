import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { TraitWeight } from '@Huemans/Shared/Domain/ValueObject/TraitWeight';

describe('TraitWeight', () => {
  it('testAcceptsAFractionOfAnAnswer', () => {
    expect(new TraitWeight(0.25).value).toBe(0.25);
  });

  it('testWholeAnswerWeighsOne', () => {
    expect(TraitWeight.wholeAnswer().value).toBe(1);
  });

  it.each([0, -0.1, 1.01, Number.NaN, Number.POSITIVE_INFINITY])('testRejects %p', (value) => {
    expect(() => new TraitWeight(value)).toThrow(InvalidArgumentError);
  });
});
