import { TraitProfile } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitProfile';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

describe('TraitProfile', () => {
  let curious: Trait;

  beforeEach(() => {
    curious = new Trait('curious');
  });

  it('testKeepsRepeatedTraits', () => {
    expect(new TraitProfile([curious, curious, new Trait('sociable')]).count()).toBe(3);
  });

  it('testRejectsAnEmptyProfile', () => {
    expect(() => new TraitProfile([])).toThrow(InvalidArgumentError);
  });
});
