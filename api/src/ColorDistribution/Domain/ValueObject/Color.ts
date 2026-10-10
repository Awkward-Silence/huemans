import { EnumValueObject } from '@Huemans/Shared/Domain/ValueObject/EnumValueObject';

// Declaration order is the tie-break order for assignment.
export const COLORS = ['RED', 'YELLOW', 'GREEN', 'BLUE'] as const;

export type ColorValue = (typeof COLORS)[number];

export class Color extends EnumValueObject<ColorValue> {
  constructor(value: string) {
    super(value, COLORS);
  }
}
