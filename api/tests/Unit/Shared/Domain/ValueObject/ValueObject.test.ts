import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { NumberValueObject } from '@Huemans/Shared/Domain/ValueObject/NumberValueObject';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

class Nickname extends StringValueObject {}
class Alias extends StringValueObject {}
class Score extends NumberValueObject {}

describe('ValueObject', () => {
  it('testEqualsWhenSameClassAndValue', () => {
    expect(new Nickname('ana').equals(new Nickname('ana'))).toBe(true);
  });

  it('testNotEqualsWhenValueDiffers', () => {
    expect(new Nickname('ana').equals(new Nickname('bea'))).toBe(false);
  });

  it('testNotEqualsWhenClassDiffers', () => {
    expect(new Nickname('ana').equals(new Alias('ana'))).toBe(false);
  });

  it('testRejectsMissingValue', () => {
    expect(() => new Nickname(undefined as unknown as string)).toThrow(InvalidArgumentError);
    expect(() => new Score(null as unknown as number)).toThrow(InvalidArgumentError);
  });

  it('testComparesNumbers', () => {
    expect(new Score(3).isBiggerThan(new Score(2))).toBe(true);
    expect(new Score(2).isBiggerThan(new Score(3))).toBe(false);
  });
});
