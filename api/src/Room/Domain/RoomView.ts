import { ColorValue } from '@Huemans/Shared/Domain/ValueObject/Color';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { AttendeeCount } from './ValueObject/AttendeeCount';
import { GroupCountCollection } from './ValueObject/GroupCountCollection';

export interface RoomView {
  eventId: string;
  total: number;
  answered: number;
  groups: { color: ColorValue; count: number }[];
}

export const RoomView = {
  of(eventId: EventId, joined: AttendeeCount, groups: GroupCountCollection): RoomView {
    return { eventId: eventId.value, total: joined.value, answered: groups.answered().value, groups: groups.toDTO() };
  },
};
