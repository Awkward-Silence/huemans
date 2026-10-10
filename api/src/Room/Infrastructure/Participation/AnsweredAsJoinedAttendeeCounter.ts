import { Inject, Injectable } from '@nestjs/common';
import { GROUP_COUNTER, GroupCounter } from '@Huemans/Room/Domain/Port/GroupCounter';
import { JoinedAttendeeCounter } from '@Huemans/Room/Domain/Port/JoinedAttendeeCounter';
import { AttendeeCount } from '@Huemans/Room/Domain/ValueObject/AttendeeCount';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

// Stub until Participation exists (quiz-and-answers): everyone who joined is assumed to have answered.
@Injectable()
export class AnsweredAsJoinedAttendeeCounter implements JoinedAttendeeCounter {
  constructor(@Inject(GROUP_COUNTER) private readonly groups: GroupCounter) {}

  async joinedIn(eventId: EventId): Promise<AttendeeCount> {
    return (await this.groups.countsOf(eventId)).answered();
  }
}
