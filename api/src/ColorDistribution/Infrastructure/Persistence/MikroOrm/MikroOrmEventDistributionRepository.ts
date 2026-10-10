import { EntityManager, EntitySchema, LockMode } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Assignment } from '@Huemans/ColorDistribution/Domain/Assignment';
import { AssignmentCollection } from '@Huemans/ColorDistribution/Domain/AssignmentCollection';
import { EventDistribution } from '@Huemans/ColorDistribution/Domain/EventDistribution';
import { EventDistributionView } from '@Huemans/ColorDistribution/Domain/EventDistributionView';
import { COLORS } from '@Huemans/ColorDistribution/Domain/ValueObject/Color';
import { EventDistributionRepository } from '@Huemans/ColorDistribution/Domain/Port/EventDistributionRepository';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { MikroOrmRepository } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/MikroOrmRepository';
import { AssignmentSchema } from './AssignmentSchema';
import { EventDistributionSchema } from './EventDistributionSchema';

@Injectable()
export class MikroOrmEventDistributionRepository
  extends MikroOrmRepository<EventDistribution>
  implements EventDistributionRepository
{
  constructor(em: EntityManager) {
    super(em);
  }

  protected entitySchema(): EntitySchema<EventDistribution> {
    return EventDistributionSchema;
  }

  // Assignments never change, so persisting them only inserts the new ones.
  async save(distribution: EventDistribution): Promise<void> {
    this.em.persist(distribution);
    this.em.persist([...distribution.assignments()]);
    await this.em.flush();
  }

  async searchForUpdate(eventId: EventId): Promise<EventDistribution | null> {
    const distribution = await this.repository().findOne({ eventId }, { lockMode: LockMode.PESSIMISTIC_WRITE });
    if (distribution === null) {
      return null;
    }
    const assignments = await this.em.find(
      AssignmentSchema,
      { eventId },
      { orderBy: { assignedAt: 'asc', attendeeId: 'asc' }, refresh: true },
    );

    // The ORM rebuilds the aggregate without its constructor, so its assignments are attached here.
    return Object.assign(distribution, { grouped: new AssignmentCollection(assignments) });
  }

  async exists(eventId: EventId): Promise<boolean> {
    return (await this.repository().count({ eventId })) > 0;
  }

  async byEvent(eventId: EventId): Promise<EventDistributionView | null> {
    // An event with no assignments yields one row with a null color; an unknown event yields none.
    const rows = await this.em.getConnection().execute<{ color: string | null; types: string[] }[]>(
      `select a.color, array_agg(a.personality_type order by a.assigned_at, a.attendee_id) as types
         from event_distributions d
         left join assignments a on a.event_id = d.event_id
        where d.event_id = ?
        group by a.color`,
      [eventId.value],
    );
    if (rows.length === 0) {
      return null;
    }
    const typesByColor = new Map(rows.filter((row) => row.color !== null).map((row) => [row.color, row.types]));

    return {
      eventId: eventId.value,
      groups: COLORS.map((color) => {
        const personalityTypes = typesByColor.get(color) ?? [];
        return { color, members: personalityTypes.length, personalityTypes };
      }),
    };
  }

  async assignmentOf(eventId: EventId, attendeeId: AttendeeId): Promise<Assignment | null> {
    return this.em.findOne(AssignmentSchema, { eventId, attendeeId });
  }
}
