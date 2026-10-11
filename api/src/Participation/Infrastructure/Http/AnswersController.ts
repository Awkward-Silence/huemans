import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import type { SubmitAnswersRequest, SubmitAnswersResponse } from '../../../../../contracts/participation';
import { ApplicationService } from '@Huemans/Participation/Application/ApplicationService';
import { UuidV7Param } from '@Huemans/Shared/Infrastructure/Http/UuidV7Param';
import { ZodValidationPipe } from '@Huemans/Shared/Infrastructure/Http/ZodValidationPipe';

const SubmitAnswersPayload = new ZodValidationPipe<SubmitAnswersRequest>(
  z.object({
    answers: z.array(z.object({ questionId: z.string(), answerId: z.string() })).max(20),
    elapsedMs: z.number().int().nonnegative().optional(),
    sentence: z.object({ question: z.string(), answer: z.string() }).nullable().optional(),
  }),
);

@Controller('events/:eventId/attendees/:attendeeId/answers')
export class AnswersController {
  constructor(private readonly service: ApplicationService) {}

  @Post()
  @HttpCode(200)
  async submit(
    @Param('eventId', UuidV7Param) eventId: string,
    @Param('attendeeId', UuidV7Param) attendeeId: string,
    @Body(SubmitAnswersPayload) request: SubmitAnswersRequest,
  ): Promise<SubmitAnswersResponse> {
    const group = await this.service.submit(eventId, attendeeId, request.answers, request.sentence ?? null);
    return { status: 'assigned', ...group } as SubmitAnswersResponse;
  }
}
