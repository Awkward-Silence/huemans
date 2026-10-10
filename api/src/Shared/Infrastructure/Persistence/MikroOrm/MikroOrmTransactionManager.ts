import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { TransactionManager } from '../../../Domain/Port/TransactionManager';

// Repositories inject the same EntityManager; inside run() MikroORM resolves it to the transaction's fork.
// clear: concurrent transactions must not share entity instances through a copied identity map.
@Injectable()
export class MikroOrmTransactionManager implements TransactionManager {
  constructor(private readonly em: EntityManager) {}

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.em.transactional(() => work(), { clear: true });
  }
}
