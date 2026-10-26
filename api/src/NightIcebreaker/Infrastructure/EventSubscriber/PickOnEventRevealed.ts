import { EntityManager, RequestContext } from '@mikro-orm/postgresql';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventRevealed } from '@Huemans/Event/Domain/EventRevealed';
import { ApplicationService } from '@Huemans/NightIcebreaker/Application/ApplicationService';
import { InMemoryEventDispatcher } from '@Huemans/Shared/Infrastructure/EventDispatcher/InMemoryEventDispatcher';

@Injectable()
export class PickOnEventRevealed implements OnModuleInit {
  constructor(
    private readonly dispatcher: InMemoryEventDispatcher,
    private readonly service: ApplicationService,
    private readonly em: EntityManager,
  ) {}

  onModuleInit(): void {
    this.dispatcher.subscribe<EventRevealed>(EventRevealed.EVENT_NAME, (event) =>
      RequestContext.create(this.em, () => this.service.pick(event.aggregateId)),
    );
  }
}
