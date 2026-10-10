import { Global, Module } from '@nestjs/common';
import { EVENT_DISPATCHER } from '../Domain/Port/EventDispatcher';
import { TRANSACTION_MANAGER } from '../Domain/Port/TransactionManager';
import { InMemoryEventDispatcher } from './EventDispatcher/InMemoryEventDispatcher';
import { MikroOrmTransactionManager } from './Persistence/MikroOrm/MikroOrmTransactionManager';

@Global()
@Module({
  providers: [
    InMemoryEventDispatcher,
    { provide: EVENT_DISPATCHER, useExisting: InMemoryEventDispatcher },
    { provide: TRANSACTION_MANAGER, useClass: MikroOrmTransactionManager },
  ],
  exports: [InMemoryEventDispatcher, EVENT_DISPATCHER, TRANSACTION_MANAGER],
})
export class SharedModule {}
