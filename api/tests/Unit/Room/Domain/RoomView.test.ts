import { RoomView } from '@Huemans/Room/Domain/RoomView';
import { AttendeeCount } from '@Huemans/Room/Domain/ValueObject/AttendeeCount';
import { GroupCount } from '@Huemans/Room/Domain/ValueObject/GroupCount';
import { GroupCountCollection } from '@Huemans/Room/Domain/ValueObject/GroupCountCollection';
import { Color, COLORS } from '@Huemans/Shared/Domain/ValueObject/Color';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

describe('RoomView', () => {
  it('testAnsweredIsTheSumOfTheGroups', () => {
    const eventId = EventId.random();
    const groups = new GroupCountCollection(
      COLORS.map((color, index) => new GroupCount(new Color(color), new AttendeeCount(index))),
    );

    expect(RoomView.of(eventId, new AttendeeCount(9), groups)).toEqual({
      eventId: eventId.value,
      total: 9,
      answered: 6,
      groups: [
        { color: 'amber', count: 0 },
        { color: 'coral', count: 1 },
        { color: 'teal', count: 2 },
        { color: 'violet', count: 3 },
      ],
    });
  });
});
