import { Injectable } from '@nestjs/common';
import { ApplicationService as ColorDistributionService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { GroupDirectory } from '@Huemans/NightIcebreaker/Domain/Port/GroupDirectory';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { Color } from '@Huemans/Shared/Domain/ValueObject/Color';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

@Injectable()
export class ColorDistributionGroupDirectory implements GroupDirectory {
  constructor(private readonly distribution: ColorDistributionService) {}

  async colorOf(eventId: EventId, attendeeId: AttendeeId): Promise<Color | null> {
    const reveal = await this.distribution.assignmentOf(eventId.value, attendeeId.value);
    return reveal === null ? null : new Color(reveal.color);
  }
}
