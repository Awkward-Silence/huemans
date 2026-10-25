import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { WeightedTrait } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';
import { RoomProfile } from '../ValueObject/RoomProfile';

export const ROOM_TRAITS_REPOSITORY = Symbol('RoomTraitsRepository');

export interface RoomTraitsRepository {
  /** Keeps the attendee's traits for the event; an attendee already kept is left unchanged. */
  add(eventId: EventId, attendeeId: AttendeeId, traits: readonly WeightedTrait[]): Promise<void>;
  profileOf(eventId: EventId): Promise<RoomProfile>;
}
