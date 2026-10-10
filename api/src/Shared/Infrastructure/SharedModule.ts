import { Global, Module } from '@nestjs/common';
import { EVENT_DISPATCHER } from '../Domain/Port/EventDispatcher';
import { InMemoryEventDispatcher } from './EventDispatcher/InMemoryEventDispatcher';

@Global()
@Module({
  providers: [InMemoryEventDispatcher, { provide: EVENT_DISPATCHER, useExisting: InMemoryEventDispatcher }],
  exports: [InMemoryEventDispatcher, EVENT_DISPATCHER],
})
export class SharedModule {}
