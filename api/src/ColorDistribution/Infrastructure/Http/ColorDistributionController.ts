import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import type { AttendeeAssignmentResponse, EventDistributionView } from '../../../../../contracts/colorDistribution';
import { ApplicationService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { UuidV7Param } from '@Huemans/Shared/Infrastructure/Http/UuidV7Param';

@Controller('events/:eventId')
export class ColorDistributionController {
  constructor(private readonly service: ApplicationService) {}

  @Get('distribution')
  async distribution(@Param('eventId', UuidV7Param) eventId: string): Promise<EventDistributionView> {
    const view = await this.service.distributionOf(eventId);
    if (view === null) {
      throw new NotFoundException(`Event <${eventId}> has no distribution`);
    }
    return view;
  }

  @Get('attendees/:attendeeId/assignment')
  async assignment(
    @Param('eventId', UuidV7Param) eventId: string,
    @Param('attendeeId', UuidV7Param) attendeeId: string,
  ): Promise<AttendeeAssignmentResponse> {
    const reveal = await this.service.assignmentOf(eventId, attendeeId);
    // Not assigned yet is a 200, never a 404: the web treats 404 as final and stops polling.
    if (reveal === null) {
      return { status: 'pending' };
    }
    const { reason, ...assignment } = reveal;
    return { status: 'assigned', ...assignment, reason: { lean: [], text: reason } };
  }
}
