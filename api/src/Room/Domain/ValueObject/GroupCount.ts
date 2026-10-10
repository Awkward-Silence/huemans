import { Color, ColorValue } from '@Huemans/Shared/Domain/ValueObject/Color';
import { AttendeeCount } from './AttendeeCount';

export class GroupCount {
  constructor(
    readonly color: Color,
    readonly count: AttendeeCount,
  ) {}

  toDTO(): { color: ColorValue; count: number } {
    return { color: this.color.value, count: this.count.value };
  }
}
