import { Inject, Injectable } from '@nestjs/common';
import { EVENT_LOOKUP, EventLookup } from '@Huemans/Room/Domain/Port/EventLookup';
import { GROUP_COUNTER, GroupCounter } from '@Huemans/Room/Domain/Port/GroupCounter';
import { JOINED_ATTENDEE_COUNTER, JoinedAttendeeCounter } from '@Huemans/Room/Domain/Port/JoinedAttendeeCounter';
import { RoomNotFound } from '@Huemans/Room/Domain/RoomNotFound';
import { RoomView } from '@Huemans/Room/Domain/RoomView';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

@Injectable()
export class ApplicationService {
  constructor(
    @Inject(EVENT_LOOKUP) private readonly events: EventLookup,
    @Inject(GROUP_COUNTER) private readonly groups: GroupCounter,
    @Inject(JOINED_ATTENDEE_COUNTER) private readonly joined: JoinedAttendeeCounter,
  ) {}

  async roomOf(eventId: string): Promise<RoomView> {
    const id = new EventId(eventId);
    if (!(await this.events.exists(id))) {
      throw new RoomNotFound(id);
    }

    return RoomView.of(id, await this.joined.joinedIn(id), await this.groups.countsOf(id));
  }
}
