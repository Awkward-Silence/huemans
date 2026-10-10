import { Constructor, EntitySchema } from '@mikro-orm/core';
import { EventDistribution } from '@Huemans/ColorDistribution/Domain/EventDistribution';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { VO } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/Types/ValueObjectTypeFactory';

// Assignments are not mapped here: the repository loads them from their own table and attaches them.
export const EventDistributionSchema = new EntitySchema<EventDistribution>({
  class: EventDistribution as unknown as Constructor<EventDistribution>,
  tableName: 'event_distributions',
  properties: {
    eventId: { type: VO.uuid(EventId), primary: true },
  },
});
