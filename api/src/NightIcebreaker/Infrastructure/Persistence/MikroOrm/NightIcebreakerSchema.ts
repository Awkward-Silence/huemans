import { Constructor, EntitySchema } from '@mikro-orm/core';
import { NightIcebreaker } from '@Huemans/NightIcebreaker/Domain/NightIcebreaker';
import { IcebreakerId } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerId';
import { IcebreakerQuestion } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerQuestion';
import { IcebreakerReason } from '@Huemans/NightIcebreaker/Domain/ValueObject/IcebreakerReason';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { VO } from '@Huemans/Shared/Infrastructure/Persistence/MikroOrm/Types/ValueObjectTypeFactory';

export const NightIcebreakerSchema = new EntitySchema<NightIcebreaker>({
  class: NightIcebreaker as unknown as Constructor<NightIcebreaker>,
  tableName: 'night_icebreakers',
  properties: {
    eventId: { type: VO.uuid(EventId), primary: true },
    icebreakerId: { type: VO.string(IcebreakerId) },
    question: { type: VO.string(IcebreakerQuestion) },
    why: { type: VO.string(IcebreakerReason) },
    pickedAt: { type: 'datetime' },
  },
});
