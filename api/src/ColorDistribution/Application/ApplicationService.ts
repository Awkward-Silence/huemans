import { Inject, Injectable } from '@nestjs/common';
import { AssignmentDTO } from '@Huemans/ColorDistribution/Domain/Assignment';
import { EventDistribution } from '@Huemans/ColorDistribution/Domain/EventDistribution';
import { EventDistributionNotFound } from '@Huemans/ColorDistribution/Domain/EventDistributionNotFound';
import { EventDistributionView } from '@Huemans/ColorDistribution/Domain/EventDistributionView';
import {
  EVENT_DISTRIBUTION_REPOSITORY,
  EventDistributionRepository,
} from '@Huemans/ColorDistribution/Domain/Port/EventDistributionRepository';
import {
  TRAIT_TYPE_MAPPING_PROVIDER,
  TraitTypeMappingProvider,
} from '@Huemans/ColorDistribution/Domain/Port/TraitTypeMappingProvider';
import { TraitProfile } from '@Huemans/ColorDistribution/Domain/ValueObject/TraitProfile';
import { EVENT_DISPATCHER, EventDispatcher } from '@Huemans/Shared/Domain/Port/EventDispatcher';
import { TRANSACTION_MANAGER, TransactionManager } from '@Huemans/Shared/Domain/Port/TransactionManager';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Trait } from '@Huemans/Shared/Domain/ValueObject/Trait';

@Injectable()
export class ApplicationService {
  constructor(
    @Inject(EVENT_DISTRIBUTION_REPOSITORY) private readonly distributions: EventDistributionRepository,
    @Inject(TRAIT_TYPE_MAPPING_PROVIDER) private readonly mappings: TraitTypeMappingProvider,
    @Inject(TRANSACTION_MANAGER) private readonly transaction: TransactionManager,
    @Inject(EVENT_DISPATCHER) private readonly dispatcher: EventDispatcher,
  ) {}

  async open(eventId: string): Promise<void> {
    const id = new EventId(eventId);
    if (await this.distributions.exists(id)) {
      return;
    }
    await this.distributions.save(EventDistribution.open(id));
  }

  async assign(eventId: string, attendeeId: string, traits: string[]): Promise<void> {
    const id = new EventId(eventId);
    const profile = new TraitProfile(traits.map((trait) => new Trait(trait)));
    const mapping = await this.mappings.mapping();

    const events = await this.transaction.run(async () => {
      const distribution = await this.distributions.searchForUpdate(id);
      if (distribution === null) {
        throw new EventDistributionNotFound(id);
      }
      distribution.assign(new AttendeeId(attendeeId), profile, mapping);
      await this.distributions.save(distribution);
      return distribution.pullDomainEvents();
    });

    await this.dispatcher.dispatchAll(events);
  }

  distributionOf(eventId: string): Promise<EventDistributionView | null> {
    return this.distributions.byEvent(new EventId(eventId));
  }

  async assignmentOf(eventId: string, attendeeId: string): Promise<AssignmentDTO | null> {
    const assignment = await this.distributions.assignmentOf(new EventId(eventId), new AttendeeId(attendeeId));
    return assignment?.toDTO() ?? null;
  }
}
