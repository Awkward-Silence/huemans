import { Injectable } from '@nestjs/common';
import { ApplicationService as ColorDistributionService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { AssignedGroup } from '@Huemans/Participation/Domain/AssignedGroup';
import { GroupDirectory } from '@Huemans/Participation/Domain/Port/GroupDirectory';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

@Injectable()
export class ColorDistributionGroupDirectory implements GroupDirectory {
  constructor(private readonly distribution: ColorDistributionService) {}

  async groupOf(eventId: EventId, attendeeId: AttendeeId): Promise<AssignedGroup | null> {
    const reveal = await this.distribution.assignmentOf(eventId.value, attendeeId.value);
    return reveal === null ? null : { color: reveal.color, personalityType: reveal.personalityType };
  }
}
