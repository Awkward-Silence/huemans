import { Color, ColorValue } from '@Huemans/Shared/Domain/ValueObject/Color';
import { StringValueObject } from '@Huemans/Shared/Domain/ValueObject/StringValueObject';

// Meeting spots are nice-to-have for the MVP, so each color has one fixed place.
const SPOTS: Record<ColorValue, string> = {
  amber: 'the bar',
  coral: 'the entrance',
  teal: 'the stage',
  violet: 'the back corner',
};

/** Where a color's group gathers once the icebreaker is revealed. */
export class MeetingSpot extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static for(color: Color): MeetingSpot {
    return new MeetingSpot(SPOTS[color.value]);
  }
}
