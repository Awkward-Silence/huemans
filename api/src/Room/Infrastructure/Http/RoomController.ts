import { Controller, Get, Param } from '@nestjs/common';
import type { RoomResponse } from '../../../../../contracts/room';
import { ApplicationService } from '@Huemans/Room/Application/ApplicationService';
import { UuidV7Param } from '@Huemans/Shared/Infrastructure/Http/UuidV7Param';

@Controller('events/:eventId')
export class RoomController {
  constructor(private readonly service: ApplicationService) {}

  @Get('room')
  room(@Param('eventId', UuidV7Param) eventId: string): Promise<RoomResponse> {
    return this.service.roomOf(eventId);
  }
}
