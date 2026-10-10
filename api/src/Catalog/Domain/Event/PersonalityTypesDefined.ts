import { DomainEvent } from '@Huemans/Shared/Domain/DomainEvent';

// PersonalityTypes is a single instance per catalog, so its events carry a fixed id.
export const PERSONALITY_TYPES_ID = 'personality-types';

export class PersonalityTypesDefined extends DomainEvent {
  static readonly EVENT_NAME = 'catalog.personality_types_defined';

  constructor() {
    super({ eventName: PersonalityTypesDefined.EVENT_NAME, aggregateId: PERSONALITY_TYPES_ID });
  }

  toPrimitives(): Record<string, never> {
    return {};
  }
}
