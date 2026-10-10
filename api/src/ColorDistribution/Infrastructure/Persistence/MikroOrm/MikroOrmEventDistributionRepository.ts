import { EntityManager, EntitySchema, LockMode } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AssignmentCollection } from '@Huemans/ColorDistribution/Domain/AssignmentCollection';
import { AttendeeAssignmentView } from '@Huemans/ColorDistribution/Domain/AttendeeAssignmentView';
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
    if (!(await this.exists(eventId))) {
      return null;
    }
    const assignments = await this.em.find(
      AssignmentSchema,
      { eventId },
      { orderBy: { assignedAt: 'asc', attendeeId: 'asc' } },
    );

    return {
      eventId: eventId.value,
      groups: COLORS.map((color) => {
        const personalityTypes = assignments
          .filter((assignment) => assignment.color.value === color)
          .map((assignment) => assignment.personalityType.value);
        return { color, members: personalityTypes.length, personalityTypes };
      }),
    };
  }

  async assignmentOf(eventId: EventId, attendeeId: AttendeeId): Promise<AttendeeAssignmentView | null> {
    const assignment = await this.em.findOne(AssignmentSchema, { eventId, attendeeId });
    if (assignment === null) {
      return null;
    }
    const mates = await this.em.count(AssignmentSchema, {
      eventId,
      color: assignment.color,
      attendeeId: { $ne: attendeeId },
    });
    return { ...assignment.toDTO(), mates };
  }
}
