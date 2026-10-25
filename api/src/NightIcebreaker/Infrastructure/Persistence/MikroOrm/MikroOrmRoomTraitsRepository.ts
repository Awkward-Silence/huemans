import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { RoomTraitsRepository } from '@Huemans/NightIcebreaker/Domain/Port/RoomTraitsRepository';
import { RoomProfile } from '@Huemans/NightIcebreaker/Domain/ValueObject/RoomProfile';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { WeightedTrait, WeightedTraitPrimitives } from '@Huemans/Shared/Domain/ValueObject/WeightedTrait';

// One row per attendee, so concurrent submits never contend on a shared event row; only read back summed.
@Injectable()
export class MikroOrmRoomTraitsRepository implements RoomTraitsRepository {
  constructor(private readonly em: EntityManager) {}

  async add(eventId: EventId, attendeeId: AttendeeId, traits: readonly WeightedTrait[]): Promise<void> {
    await this.em
      .getConnection()
      .execute(
        'insert into "room_traits" ("event_id", "attendee_id", "traits") values (?, ?, ?) on conflict do nothing',
        [eventId.value, attendeeId.value, JSON.stringify(traits.map((trait) => trait.toPrimitives()))],
      );
  }

  async profileOf(eventId: EventId): Promise<RoomProfile> {
    const rows = await this.em
      .getConnection()
      .execute<{ traits: WeightedTraitPrimitives[] }[]>('select "traits" from "room_traits" where "event_id" = ?', [
        eventId.value,
      ]);

    return new RoomProfile(rows.flatMap((row) => row.traits.map((trait) => WeightedTrait.fromPrimitives(trait))));
  }
}
