import { EventStatusValue } from './ValueObject/EventStatus';

export interface EventView {
  id: string;
  name: string;
  status: EventStatusValue;
}
