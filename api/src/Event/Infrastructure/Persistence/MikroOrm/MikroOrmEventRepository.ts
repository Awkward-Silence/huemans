import { EntityManager, EntitySchema } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Event } from '@Huemans/Event/Domain/Event';
import { EventRepository } from '@Huemans/Event/Domain/Port/EventRepository';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { MikroOrmRepository } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/MikroOrmRepository';
import { EventSchema } from './EventSchema';

@Injectable()
export class MikroOrmEventRepository extends MikroOrmRepository<Event> implements EventRepository {
  constructor(em: EntityManager) {
    super(em);
  }

  protected entitySchema(): EntitySchema<Event> {
    return EventSchema;
  }

  search(id: EventId): Promise<Event | null> {
    return this.repository().findOne({ id });
  }
}
