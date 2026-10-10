import { Module } from '@nestjs/common';
import { ColorDistributionModule } from '@Huemans/ColorDistribution/Infrastructure/ColorDistributionModule';
import { EventModule } from '@Huemans/Event/Infrastructure/EventModule';
import { ApplicationService } from '@Huemans/Room/Application/ApplicationService';
import { EVENT_LOOKUP } from '@Huemans/Room/Domain/Port/EventLookup';
import { GROUP_COUNTER } from '@Huemans/Room/Domain/Port/GroupCounter';
import { JOINED_ATTENDEE_COUNTER } from '@Huemans/Room/Domain/Port/JoinedAttendeeCounter';
import { DistributionGroupCounter } from './ColorDistribution/DistributionGroupCounter';
import { ApplicationServiceEventLookup } from './Event/ApplicationServiceEventLookup';
import { RoomController } from './Http/RoomController';
import { AnsweredAsJoinedAttendeeCounter } from './Participation/AnsweredAsJoinedAttendeeCounter';

@Module({
  imports: [EventModule, ColorDistributionModule],
  controllers: [RoomController],
  providers: [
    ApplicationService,
    { provide: EVENT_LOOKUP, useClass: ApplicationServiceEventLookup },
    { provide: GROUP_COUNTER, useClass: DistributionGroupCounter },
    { provide: JOINED_ATTENDEE_COUNTER, useClass: AnsweredAsJoinedAttendeeCounter },
  ],
})
export class RoomModule {}
