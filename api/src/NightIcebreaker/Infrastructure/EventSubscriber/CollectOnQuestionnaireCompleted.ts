import { EntityManager, RequestContext } from '@mikro-orm/postgresql';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApplicationService } from '@Huemans/NightIcebreaker/Application/ApplicationService';
import { QuestionnaireCompleted } from '@Huemans/Shared/Domain/Event/QuestionnaireCompleted';
import { InMemoryEventDispatcher } from '@Huemans/Shared/Infrastructure/EventDispatcher/InMemoryEventDispatcher';

@Injectable()
export class CollectOnQuestionnaireCompleted implements OnModuleInit {
  constructor(
    private readonly dispatcher: InMemoryEventDispatcher,
    private readonly service: ApplicationService,
    private readonly em: EntityManager,
  ) {}

  onModuleInit(): void {
    this.dispatcher.subscribe<QuestionnaireCompleted>(QuestionnaireCompleted.EVENT_NAME, (event) =>
      RequestContext.create(this.em, () => this.service.collect(event.forEventId, event.aggregateId, event.traits)),
    );
  }
}
