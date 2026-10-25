import { EntityManager, EntitySchema } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Attendee } from '@Huemans/Participation/Domain/Attendee';
import { AttendeeRepository } from '@Huemans/Participation/Domain/Port/AttendeeRepository';
import { AttendeeCount } from '@Huemans/Participation/Domain/ValueObject/AttendeeCount';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { MikroOrmRepository } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/MikroOrmRepository';
import { AttendeeSchema } from './AttendeeSchema';

@Injectable()
export class MikroOrmAttendeeRepository extends MikroOrmRepository<Attendee> implements AttendeeRepository {
  constructor(em: EntityManager) {
    super(em);
  }

  protected entitySchema(): EntitySchema<Attendee> {
    return AttendeeSchema;
  }

  searchIn(eventId: EventId, attendeeId: AttendeeId): Promise<Attendee | null> {
    return this.repository().findOne({ id: attendeeId, eventId });
  }

  async countIn(eventId: EventId): Promise<AttendeeCount> {
    return new AttendeeCount(await this.repository().count({ eventId }));
  }
}
