import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CatalogSeedRecord } from '@Huemans/Catalog/Domain/Port/CatalogSeedRecord';
import { CatalogSeedSchema } from './CatalogSeedSchema';

// One row for the whole catalog. Inserting it first in the seed's transaction makes a concurrent seed wait on the
// key and then see the conflict, so only one seed ever writes.
const CATALOG = 'catalog';

@Injectable()
export class MikroOrmCatalogSeedRecord implements CatalogSeedRecord {
  constructor(private readonly em: EntityManager) {}

  async markSeeded(at: Date): Promise<boolean> {
    const result = await this.em
      .createQueryBuilder(CatalogSeedSchema)
      .insert({ id: CATALOG, seededAt: at })
      .onConflict('id')
      .ignore()
      .execute<{ affectedRows: number }>('run');
    return result.affectedRows === 1;
  }

  async seededAt(): Promise<Date | null> {
    const row = await this.em.findOne(CatalogSeedSchema, { id: CATALOG }, { disableIdentityMap: true });
    return row?.seededAt ?? null;
  }
}
