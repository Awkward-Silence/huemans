import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { Assignment } from '../Assignment';
import { EventDistribution } from '../EventDistribution';
import { EventDistributionView } from '../EventDistributionView';

export const EVENT_DISTRIBUTION_REPOSITORY = Symbol('EventDistributionRepository');

export interface EventDistributionRepository {
  save(distribution: EventDistribution): Promise<void>;
  /** Locks the distribution until the surrounding transaction ends, so assignments in one event never interleave. */
  searchForUpdate(eventId: EventId): Promise<EventDistribution | null>;
  exists(eventId: EventId): Promise<boolean>;
  byEvent(eventId: EventId): Promise<EventDistributionView | null>;
  assignmentOf(eventId: EventId, attendeeId: AttendeeId): Promise<Assignment | null>;
}
