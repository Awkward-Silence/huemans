import { Collection } from '@Huemans/Shared/Domain/Collection';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { COLORS, ColorValue } from '@Huemans/Shared/Domain/ValueObject/Color';
import { AttendeeCount } from './AttendeeCount';
import { GroupCount } from './GroupCount';

export class GroupCountCollection extends Collection<GroupCount> {
  constructor(groups: readonly GroupCount[]) {
    super(groups);
    const colors = groups.map((group) => group.color.value);
    if (colors.length !== COLORS.length || colors.some((color, index) => color !== COLORS[index])) {
      throw new InvalidArgumentError(`<GroupCountCollection> needs exactly ${COLORS.join(', ')}, in that order`);
    }
  }

  protected type(): typeof GroupCount {
    return GroupCount;
  }

  answered(): AttendeeCount {
    return this.all().reduce((sum, group) => sum.plus(group.count), new AttendeeCount(0));
  }

  toDTO(): { color: ColorValue; count: number }[] {
    return this.all().map((group) => group.toDTO());
  }
}
