import { EntityManager, RequestContext } from '@mikro-orm/postgresql';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApplicationService } from '@Huemans/ColorDistribution/Application/ApplicationService';
import { AttendeeAlreadyAssigned } from '@Huemans/ColorDistribution/Domain/AttendeeAlreadyAssigned';
import { QuestionnaireCompleted } from '@Huemans/Shared/Domain/Event/QuestionnaireCompleted';
import { InMemoryEventDispatcher } from '@Huemans/Shared/Infrastructure/EventDispatcher/InMemoryEventDispatcher';

@Injectable()
export class AssignOnQuestionnaireCompleted implements OnModuleInit {
  constructor(
    private readonly dispatcher: InMemoryEventDispatcher,
    private readonly service: ApplicationService,
    private readonly em: EntityManager,
  ) {}

  onModuleInit(): void {
    this.dispatcher.subscribe<QuestionnaireCompleted>(QuestionnaireCompleted.EVENT_NAME, (event) =>
      RequestContext.create(this.em, () => this.assign(event)),
    );
  }

  // A repeated completion keeps the first assignment, so it is already handled.
  private async assign(event: QuestionnaireCompleted): Promise<void> {
    try {
      await this.service.assign(event.forEventId, event.aggregateId, event.traits);
    } catch (error) {
      if (!(error instanceof AttendeeAlreadyAssigned)) {
        throw error;
      }
    }
  }
}
