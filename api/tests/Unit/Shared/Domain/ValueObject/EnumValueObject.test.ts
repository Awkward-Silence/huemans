import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { EnumValueObject } from '@Huemans/Shared/Domain/ValueObject/EnumValueObject';

const SIZES = ['small', 'large'] as const;
type SizeValue = (typeof SIZES)[number];

class Size extends EnumValueObject<SizeValue> {
  constructor(value: string) {
    super(value, SIZES);
  }
}

describe('EnumValueObject', () => {
  it('testAcceptsListedValue', () => {
    expect(new Size('small').value).toBe('small');
  });

  it('testRejectsUnlistedValue', () => {
    expect(() => new Size('huge')).toThrow(InvalidArgumentError);
  });

  it('testEqualsSameListedValue', () => {
    expect(new Size('large').equals(new Size('large'))).toBe(true);
  });
});
