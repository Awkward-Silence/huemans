import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { NightIcebreaker } from '../NightIcebreaker';

export const NIGHT_ICEBREAKER_REPOSITORY = Symbol('NightIcebreakerRepository');

export interface NightIcebreakerRepository {
  save(icebreaker: NightIcebreaker): Promise<void>;
  /** Null until the event is revealed and its icebreaker picked. */
  search(eventId: EventId): Promise<NightIcebreaker | null>;
}
