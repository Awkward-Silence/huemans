import { PersonalityType } from '@Huemans/ColorDistribution/Domain/ValueObject/PersonalityType';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('PersonalityType', () => {
  it('testAcceptsTheFourTypes', () => {
    for (const type of ['explorer', 'connector', 'planner', 'dreamer']) {
      expect(new PersonalityType(type).value).toBe(type);
    }
  });

  it('testRejectsAnUnknownType', () => {
    expect(() => new PersonalityType('rockstar')).toThrow(InvalidArgumentError);
  });
});
