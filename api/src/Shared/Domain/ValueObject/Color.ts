import { EnumValueObject } from './EnumValueObject';

// The four group colors, named as in web/. Declaration order is the tie-break order for assignment and the order of every per-color list.
export const COLORS = ['amber', 'coral', 'teal', 'violet'] as const;

export type ColorValue = (typeof COLORS)[number];

export class Color extends EnumValueObject<ColorValue> {
  constructor(value: string) {
    super(value, COLORS);
  }
}
