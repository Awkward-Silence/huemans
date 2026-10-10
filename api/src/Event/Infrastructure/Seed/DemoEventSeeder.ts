import { CreateRequestContext, MikroORM } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ApplicationService } from '@Huemans/Event/Application/ApplicationService';
import { EventView } from '@Huemans/Event/Domain/EventView';

// Fixed so web/'s VITE_DEMO_EVENT_ID and the printed QR code keep working across databases. A valid UUIDv7, not time-ordered.
export const DEMO_EVENT_ID = '0199c0de-0000-7000-8000-000000000001';

@Injectable()
export class DemoEventSeeder {
  // `orm` is read by @CreateRequestContext: the seed runs outside an HTTP request, which is where MikroORM normally gets its context.
  constructor(
    private readonly events: ApplicationService,
    private readonly orm: MikroORM,
  ) {}

  @CreateRequestContext()
  seed(): Promise<EventView> {
    return this.events.ensure(DEMO_EVENT_ID, 'Demo night');
  }
}
