import { EntityManager, EntitySchema } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { NightIcebreaker } from '@Huemans/NightIcebreaker/Domain/NightIcebreaker';
import { NightIcebreakerRepository } from '@Huemans/NightIcebreaker/Domain/Port/NightIcebreakerRepository';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { MikroOrmRepository } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/MikroOrmRepository';
import { NightIcebreakerSchema } from './NightIcebreakerSchema';

@Injectable()
export class MikroOrmNightIcebreakerRepository
  extends MikroOrmRepository<NightIcebreaker>
  implements NightIcebreakerRepository
{
  constructor(em: EntityManager) {
    super(em);
  }

  protected entitySchema(): EntitySchema<NightIcebreaker> {
    return NightIcebreakerSchema;
  }

  search(eventId: EventId): Promise<NightIcebreaker | null> {
    return this.repository().findOne({ eventId });
  }
}
