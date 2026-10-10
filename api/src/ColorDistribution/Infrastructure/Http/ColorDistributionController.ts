import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { z } from 'zod';
import type { AttendeeAssignmentResponse, EventDistributionView } from '../../../../../contracts/colorDistribution';
import { ApplicationService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { EventDistributionNotFound } from '@Huemans/ColorDistribution/Domain/EventDistributionNotFound';
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
  ): Promise<AttendeeAssignmentResponse> {
    try {
      const assignment = await this.service.assignmentOf(eventId, attendeeId);
      // Not assigned yet is a 200, never a 404: the web treats 404 as final and stops polling.
      return assignment === null ? { status: 'pending' } : { status: 'assigned', ...assignment };
    } catch (error) {
      if (error instanceof EventDistributionNotFound) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
