import { EntitySchema } from '@mikro-orm/core';
import { Assignment } from '@Huemans/ColorDistribution/Domain/Assignment';
import { Color } from '@Huemans/ColorDistribution/Domain/ValueObject/Color';
import { PersonalityType } from '@Huemans/ColorDistribution/Domain/ValueObject/PersonalityType';
import { AttendeeId } from '@Huemans/Shared/Domain/ValueObject/AttendeeId';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { VO } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/Types/ValueObjectTypeFactory';

export const AssignmentSchema = new EntitySchema<Assignment>({
  class: Assignment,
  tableName: 'assignments',
  properties: {
    eventId: { type: VO.uuid(EventId), primary: true },
    attendeeId: { type: VO.uuid(AttendeeId), primary: true },
    color: { type: VO.enum(Color) },
    personalityType: { type: VO.enum(PersonalityType) },
    assignedAt: { type: 'datetime' },
  },
});
