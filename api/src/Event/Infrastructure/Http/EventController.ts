import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import type { CreateEventRequest, EventResponse } from '../../../../../contracts/event';
import { ApplicationService } from '@Huemans/Event/Application/ApplicationService';
import { EventView } from '@Huemans/Event/Domain/EventView';
import { QuizSettings } from '@Huemans/Participation/Domain/ValueObject/QuizSettings';
import { UuidV7Param } from '@Huemans/Shared/Infrastructure/Http/UuidV7Param';
import { ZodValidationPipe } from '@Huemans/Shared/Infrastructure/Http/ZodValidationPipe';

const CreateEventPayload = new ZodValidationPipe<CreateEventRequest>(z.object({ name: z.string() }));

@Controller('events')
export class EventController {
  constructor(private readonly service: ApplicationService) {}

  @Post()
  async create(@Body(CreateEventPayload) request: CreateEventRequest): Promise<EventResponse> {
    return this.withQuizSettings(await this.service.create(request.name));
  }

  @Get(':eventId')
  async event(@Param('eventId', UuidV7Param) eventId: string): Promise<EventResponse> {
    return this.withQuizSettings(await this.service.eventOf(eventId));
  }

  @Post(':eventId/reveal')
  @HttpCode(200)
  async reveal(@Param('eventId', UuidV7Param) eventId: string): Promise<EventResponse> {
    return this.withQuizSettings(await this.service.reveal(eventId));
  }

  // The quiz settings are Participation's and fixed, so they are read as a value instead of through its module,
  // which already imports EventModule.
  private withQuizSettings(view: EventView): EventResponse {
    const { questionCount, durationSeconds } = QuizSettings.standard().toPrimitives();
    return { ...view, questionCount, quizDurationSeconds: durationSeconds };
  }
}
