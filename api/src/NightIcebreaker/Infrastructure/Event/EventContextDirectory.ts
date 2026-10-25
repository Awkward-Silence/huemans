import { Injectable } from '@nestjs/common';
import { ApplicationService as EventService } from '@Huemans/Event/Application/ApplicationService';
import { EventNotFound } from '@Huemans/Event/Domain/EventNotFound';
import { EventDirectory } from '@Huemans/NightIcebreaker/Domain/Port/EventDirectory';
import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';

@Injectable()
export class EventContextDirectory implements EventDirectory {
  constructor(private readonly events: EventService) {}

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
