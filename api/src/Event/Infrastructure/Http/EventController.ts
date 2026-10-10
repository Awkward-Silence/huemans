import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import type { CreateEventRequest, EventResponse } from '../../../../../contracts/event';
import { ApplicationService } from '@Huemans/Event/Application/ApplicationService';
import { EventView } from '@Huemans/Event/Domain/EventView';
import { UuidV7Param } from '@Huemans/Shared/Infrastructure/Http/UuidV7Param';
import { ZodValidationPipe } from '@Huemans/Shared/Infrastructure/Http/ZodValidationPipe';

// Placeholder for Participation's quiz settings, which Event does not own; quiz-and-answers reads them from there.
const QUESTION_COUNT = 5;
const QUIZ_DURATION_SECONDS = 20;

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

  private withQuizSettings(view: EventView): EventResponse {
    return { ...view, questionCount: QUESTION_COUNT, quizDurationSeconds: QUIZ_DURATION_SECONDS };
  }
}
