import { GroupCount } from '@Huemans/Room/Domain/ValueObject/GroupCount';
import { GroupCountCollection } from '@Huemans/Room/Domain/ValueObject/GroupCountCollection';
import { AttendeeCount } from '@Huemans/Room/Domain/ValueObject/AttendeeCount';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { Color } from '@Huemans/Shared/Domain/ValueObject/Color';

function group(color: string, count: number): GroupCount {
  return new GroupCount(new Color(color), new AttendeeCount(count));
}

describe('GroupCountCollection', () => {
  let groups: GroupCountCollection;

  beforeEach(() => {
    groups = new GroupCountCollection([group('amber', 2), group('coral', 1), group('teal', 0), group('violet', 3)]);
  });

  it('testAnsweredIsTheSumOfTheCounts', () => {
    expect(groups.answered().value).toBe(6);
  });

  it('testListsTheFourColorsInOrder', () => {
    expect(groups.toDTO()).toEqual([
      { color: 'amber', count: 2 },
      { color: 'coral', count: 1 },
      { color: 'teal', count: 0 },
      { color: 'violet', count: 3 },
    ]);
  });

  it('testRejectsAMissingColor', () => {
    expect(() => new GroupCountCollection([group('amber', 0), group('coral', 0), group('teal', 0)])).toThrow(
      InvalidArgumentError,
    );
  });

  it('testRejectsARepeatedColor', () => {
    expect(
      () => new GroupCountCollection([group('amber', 0), group('coral', 0), group('teal', 0), group('teal', 0)]),
    ).toThrow(InvalidArgumentError);
  });

  it('testRejectsColorsOutOfOrder', () => {
    expect(
      () => new GroupCountCollection([group('coral', 0), group('amber', 0), group('teal', 0), group('violet', 0)]),
    ).toThrow(InvalidArgumentError);
  });
});
