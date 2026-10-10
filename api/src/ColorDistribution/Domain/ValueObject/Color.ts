import { EnumValueObject } from '@Huemans/Shared/Domain/ValueObject/EnumValueObject';
import { COLORS, type ColorValue } from '@Huemans/Types/Color';

export { COLORS };
export type { ColorValue };

export class Color extends EnumValueObject<ColorValue> {
  constructor(value: string) {
    super(value, COLORS);
  }
}
