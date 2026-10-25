import { Constructor, EntitySchema } from '@mikro-orm/core';
import { Event } from '@Huemans/Event/Domain/Event';
import { EventName } from '@Huemans/Event/Domain/ValueObject/EventName';
import { EventStatus } from '@Huemans/Event/Domain/ValueObject/EventStatus';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { VO } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/Types/ValueObjectTypeFactory';

export const EventSchema = new EntitySchema<Event>({
  class: Event as unknown as Constructor<Event>,
  tableName: 'events',
  properties: {
    id: { type: VO.uuid(EventId), primary: true },
    name: { type: VO.string(EventName) },
    // Private in the domain, so only reveal() changes it; the ORM still reads and writes it by name.
    ...({ status: { type: VO.enum(EventStatus) } } as object),
  },
});
