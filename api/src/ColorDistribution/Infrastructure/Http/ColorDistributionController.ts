import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { z } from 'zod';
import type {
  AttendeeAssignment,
  AttendeeAssignmentResponse,
  EventDistributionView,
} from '../../../../../contracts/colorDistribution';
import { ApplicationService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { AttendeeAssignmentView } from '@Huemans/ColorDistribution/Domain/AttendeeAssignmentView';
import { EventDistributionNotFound } from '@Huemans/ColorDistribution/Domain/EventDistributionNotFound';
import { ZodValidationPipe } from '@Huemans/Shared/Infrastructure/Http/ZodValidationPipe';
import { PERSONALITY_TYPE_PROFILES } from '@Huemans/Types/PersonalityType';

const UuidV7Param = new ZodValidationPipe(z.uuidv7());

// Static reveal copy; the ColorExplainer agent may later personalize nickname, blurb and reason.text.
function assigned({ groupMembers, ...assignment }: AttendeeAssignmentView): AttendeeAssignment {
  const profile = PERSONALITY_TYPE_PROFILES[assignment.personalityType];
  return {
    status: 'assigned',
    ...assignment,
    nickname: profile.nickname,
    blurb: profile.blurb,
    traits: profile.traits,
    mates: groupMembers - 1,
    reason: {
      lean: [],
      text: `Most of your answers were ${assignment.personalityType} answers. Groups are mixed on purpose, and ${assignment.color} had room for another ${assignment.personalityType}.`,
    },
  };
}

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
      return assignment === null ? { status: 'pending' } : assigned(assignment);
    } catch (error) {
      if (error instanceof EventDistributionNotFound) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
