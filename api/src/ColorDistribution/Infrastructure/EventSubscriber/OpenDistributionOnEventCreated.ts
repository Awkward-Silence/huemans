import { EntityManager, RequestContext } from '@mikro-orm/postgresql';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApplicationService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { EventCreated } from '@Huemans/Event/Domain/EventCreated';
import { InMemoryEventDispatcher } from '@Huemans/Shared/Infrastructure/EventDispatcher/InMemoryEventDispatcher';

@Injectable()
export class OpenDistributionOnEventCreated implements OnModuleInit {
  constructor(
    private readonly dispatcher: InMemoryEventDispatcher,
    private readonly service: ApplicationService,
    private readonly em: EntityManager,
  ) {}

  onModuleInit(): void {
    this.dispatcher.subscribe<EventCreated>(EventCreated.EVENT_NAME, (event) =>
      RequestContext.create(this.em, () => this.service.open(event.aggregateId)),
    );
  }
}
