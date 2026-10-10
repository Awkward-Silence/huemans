import { EntitySchema } from '@mikro-orm/core';

export interface CatalogSeedRow {
  id: string;
  seededAt: Date;
}

export const CatalogSeedSchema = new EntitySchema<CatalogSeedRow>({
  name: 'CatalogSeed',
  tableName: 'catalog_seed',
  properties: {
    id: { type: 'string', columnType: 'text', primary: true },
    seededAt: { type: 'Date', columnType: 'timestamptz' },
  },
});
