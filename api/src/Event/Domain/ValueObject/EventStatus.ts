import { EnumValueObject } from '@Huemans/Shared/Domain/ValueObject/EnumValueObject';

export const EVENT_STATUSES = ['open', 'revealed'] as const;

export type EventStatusValue = (typeof EVENT_STATUSES)[number];

export class EventStatus extends EnumValueObject<EventStatusValue> {
  constructor(value: string) {
    super(value, EVENT_STATUSES);
  }

  static open(): EventStatus {
    return new EventStatus('open');
  }
}
