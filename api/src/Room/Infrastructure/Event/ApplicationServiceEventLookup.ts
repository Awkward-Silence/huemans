import { Injectable } from '@nestjs/common';
import { ApplicationService as EventApplicationService } from '@Huemans/Event/Application/ApplicationService';
import { EventNotFound } from '@Huemans/Event/Domain/EventNotFound';
import { EventLookup } from '@Huemans/Room/Domain/Port/EventLookup';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

@Injectable()
export class ApplicationServiceEventLookup implements EventLookup {
  constructor(private readonly events: EventApplicationService) {}

  async exists(eventId: EventId): Promise<boolean> {
    try {
      await this.events.eventOf(eventId.value);
      return true;
    } catch (error) {
      if (error instanceof EventNotFound) {
        return false;
      }
      throw error;
    }
  }
}
