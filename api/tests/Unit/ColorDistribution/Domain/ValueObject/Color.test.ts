import { Color, COLORS } from '@Huemans/ColorDistribution/Domain/ValueObject/Color';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';

describe('Color', () => {
  it('testAcceptsTheFourGroupColors', () => {
    expect(COLORS.map((color) => new Color(color).value)).toEqual(['RED', 'YELLOW', 'GREEN', 'BLUE']);
  });

  it('testRejectsAnUnknownColor', () => {
    expect(() => new Color('PURPLE')).toThrow(InvalidArgumentError);
  });
});
