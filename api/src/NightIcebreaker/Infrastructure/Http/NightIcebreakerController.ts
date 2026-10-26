import { Controller, Get, Param } from '@nestjs/common';
import type { AttendeeIcebreakerResponse, HostIcebreakerResponse } from '../../../../contracts/nightIcebreaker';
import { ApplicationService } from '@Huemans/NightIcebreaker/Application/ApplicationService';
import { UuidV7Param } from '@Huemans/Shared/Infrastructure/Http/UuidV7Param';

@Controller('events/:eventId')
export class NightIcebreakerController {
  constructor(private readonly service: ApplicationService) {}

  @Get('icebreaker')
  forHost(@Param('eventId', UuidV7Param) eventId: string): Promise<HostIcebreakerResponse> {
    return this.service.forHost(eventId);
  }

  @Get('attendees/:attendeeId/icebreaker')
  forAttendee(
    @Param('eventId', UuidV7Param) eventId: string,
    @Param('attendeeId', UuidV7Param) attendeeId: string,
  ): Promise<AttendeeIcebreakerResponse> {
    return this.service.forAttendee(eventId, attendeeId);
  }
}
