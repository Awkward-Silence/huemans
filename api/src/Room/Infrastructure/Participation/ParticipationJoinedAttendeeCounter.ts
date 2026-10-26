import { Injectable } from '@nestjs/common';
import { ApplicationService as ParticipationService } from '@Huemans/Participation/Application/ApplicationService';
import { JoinedAttendeeCounter } from '@Huemans/Room/Domain/Port/JoinedAttendeeCounter';
import { AttendeeCount } from '@Huemans/Room/Domain/ValueObject/AttendeeCount';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

@Injectable()
export class ParticipationJoinedAttendeeCounter implements JoinedAttendeeCounter {
  constructor(private readonly participation: ParticipationService) {}

  async joinedIn(eventId: EventId): Promise<AttendeeCount> {
    return new AttendeeCount(await this.participation.joinedCount(eventId.value));
  }
}
