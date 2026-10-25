import { Body, Controller, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import type { JoinRequest, JoinResponse } from '../../../../../contracts/participation';
import { ApplicationService } from '@Huemans/Participation/Application/ApplicationService';
import { UuidV7Param } from '@Huemans/Shared/Infrastructure/Http/UuidV7Param';
import { ZodValidationPipe } from '@Huemans/Shared/Infrastructure/Http/ZodValidationPipe';

const JoinPayload = new ZodValidationPipe<JoinRequest>(z.object({ name: z.string() }));

@Controller('events/:eventId/attendees')
export class AttendeesController {
  constructor(private readonly service: ApplicationService) {}

  @Post()
  join(@Param('eventId', UuidV7Param) eventId: string, @Body(JoinPayload) request: JoinRequest): Promise<JoinResponse> {
    return this.service.join(eventId, request.name);
  }
}
