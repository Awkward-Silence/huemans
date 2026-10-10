import { Injectable } from '@nestjs/common';
import { ApplicationService as ColorDistributionApplicationService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { GroupCounter } from '@Huemans/Room/Domain/Port/GroupCounter';
import { AttendeeCount } from '@Huemans/Room/Domain/ValueObject/AttendeeCount';
import { GroupCount } from '@Huemans/Room/Domain/ValueObject/GroupCount';
import { GroupCountCollection } from '@Huemans/Room/Domain/ValueObject/GroupCountCollection';
import { Color } from '@Huemans/Shared/Domain/ValueObject/Color';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

@Injectable()
export class DistributionGroupCounter implements GroupCounter {
  constructor(private readonly distributions: ColorDistributionApplicationService) {}

  async countsOf(eventId: EventId): Promise<GroupCountCollection> {
    const distribution = await this.distributions.distributionOf(eventId.value);
    // EventCreated opens the distribution in the same request, so an existing event always has one.
    if (distribution === null) {
      throw new Error(`Event <${eventId.value}> exists but has no distribution`);
    }
    return new GroupCountCollection(
      distribution.groups.map((group) => new GroupCount(new Color(group.color), new AttendeeCount(group.members))),
    );
  }
}
