import { Constructor, EntitySchema } from '@mikro-orm/core';
import { Attendee } from '@Huemans/Participation/Domain/Attendee';
import { AttendeeName } from '@Huemans/Participation/Domain/ValueObject/AttendeeName';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { VO } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/Types/ValueObjectTypeFactory';

export const AttendeeSchema = new EntitySchema<Attendee>({
  class: Attendee as unknown as Constructor<Attendee>,
  tableName: 'attendees',
  properties: {
    id: { type: VO.uuid(AttendeeId), primary: true },
    eventId: { type: VO.uuid(EventId) },
    name: { type: VO.string(AttendeeName) },
    joinedAt: { type: 'datetime' },
  },
});
