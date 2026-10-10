import { EntityManager, EntityRepository, EntitySchema } from '@mikro-orm/postgresql';
import { GetRepository } from '@mikro-orm/core';
import { AggregateRoot } from '../../../Domain/AggregateRoot';

export abstract class MikroOrmRepository<T extends AggregateRoot> {
  protected constructor(protected readonly em: EntityManager) {}

  protected abstract entitySchema(): EntitySchema<T>;

  async save(aggregate: T): Promise<void> {
    await this.em.persistAndFlush(aggregate);
  }

  protected repository(): GetRepository<T, EntityRepository<T>> {
    return this.em.getRepository(this.entitySchema());
  }
}
