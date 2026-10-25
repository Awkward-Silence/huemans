import { EntityManager, RequestContext, UniqueConstraintViolationException } from '@mikro-orm/postgresql';
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
      RequestContext.create(this.em, () => this.pick(event)),
    );
  }

  // Two simultaneous reveals can both see the event open; the first pick wins and the second finds it taken.
  private async pick(event: EventRevealed): Promise<void> {
    try {
      await this.service.pick(event.aggregateId);
    } catch (error) {
      if (!(error instanceof UniqueConstraintViolationException)) {
        throw error;
      }
    }
  }
}
