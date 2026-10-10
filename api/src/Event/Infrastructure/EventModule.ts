import { Module } from '@nestjs/common';
import { ApplicationService } from '@Huemans/Event/Application/ApplicationService';
import { EVENT_REPOSITORY } from '@Huemans/Event/Domain/Port/EventRepository';
import { EventController } from './Http/EventController';
import { MikroOrmEventRepository } from './Persistence/MikroOrm/MikroOrmEventRepository';

@Module({
  controllers: [EventController],
  providers: [ApplicationService, { provide: EVENT_REPOSITORY, useClass: MikroOrmEventRepository }],
  exports: [ApplicationService],
})
export class EventModule {}
