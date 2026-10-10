import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { GroupCountCollection } from '../ValueObject/GroupCountCollection';

export const GROUP_COUNTER = Symbol('GroupCounter');

export interface GroupCounter {
  countsOf(eventId: EventId): Promise<GroupCountCollection>;
}
