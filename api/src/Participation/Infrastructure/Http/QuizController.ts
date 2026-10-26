import { Controller, Get, Param } from '@nestjs/common';
import type { QuizResponse } from '../../../../contracts/participation';
import { ApplicationService } from '@Huemans/Participation/Application/ApplicationService';
import { UuidV7Param } from '@Huemans/Shared/Infrastructure/Http/UuidV7Param';

@Controller('events/:eventId/quiz')
export class QuizController {
  constructor(private readonly service: ApplicationService) {}

  @Get()
  quiz(@Param('eventId', UuidV7Param) eventId: string): Promise<QuizResponse> {
    return this.service.quizOf(eventId);
  }
}
