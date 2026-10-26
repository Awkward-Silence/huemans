import { IcebreakerCandidate } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerCandidate';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('IcebreakerCandidate', () => {
  it('testHoldsIdQuestionAndTraits', () => {
    const candidate = IcebreakerCandidate.fromPrimitives({ id: 'i0001', text: 'Why?', traits: ['curious'] });

    expect(candidate.id.value).toBe('i0001');
    expect(candidate.question.value).toBe('Why?');
    expect(candidate.traits.map((trait) => trait.value)).toEqual(['curious']);
  });

  it('testRejectsAnEmptyId', () => {
    expect(() => IcebreakerCandidate.fromPrimitives({ id: ' ', text: 'Why?', traits: ['curious'] })).toThrow(
      InvalidArgumentError,
    );
  });

  it('testRejectsAnEmptyQuestion', () => {
    expect(() => IcebreakerCandidate.fromPrimitives({ id: 'i0001', text: '', traits: ['curious'] })).toThrow(
      InvalidArgumentError,
    );
  });

  it('testRejectsNoTraits', () => {
    expect(() => IcebreakerCandidate.fromPrimitives({ id: 'i0001', text: 'Why?', traits: [] })).toThrow(
      InvalidArgumentError,
    );
  });
});
