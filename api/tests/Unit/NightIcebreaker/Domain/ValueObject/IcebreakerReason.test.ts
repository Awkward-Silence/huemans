import { IcebreakerReason } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerReason';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('IcebreakerReason', () => {
  it('testRejectsAnEmptyReason', () => {
    expect(() => new IcebreakerReason('  ')).toThrow(InvalidArgumentError);
  });

  it('testKeepsTheSentence', () => {
    expect(new IcebreakerReason('Picked for everyone here tonight.').value).toBe('Picked for everyone here tonight.');
  });
});
