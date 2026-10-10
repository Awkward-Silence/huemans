import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { z } from 'zod';
import type {
  AttendeeAssignment,
  AttendeeNotAssigned,
  EventDistributionView,
} from '../../../../../contracts/colorDistribution';
import { ApplicationService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { ZodValidationPipe } from '@Huemans/Shared/Infrastructure/Http/ZodValidationPipe';

const UuidV7Param = new ZodValidationPipe(z.uuidv7());

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
  ): Promise<AttendeeAssignment> {
    const assignment = await this.service.assignmentOf(eventId, attendeeId);
    if (assignment === null) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'not_assigned',
        message: `Attendee <${attendeeId}> is not assigned in event <${eventId}>`,
      } satisfies AttendeeNotAssigned);
    }
    return assignment;
  }
}
