import { EntitySchema } from '@mikro-orm/core';

export interface CatalogTraitTypeRow {
  trait: string;
  personalityType: string;
}

export const CatalogTraitTypeSchema = new EntitySchema<CatalogTraitTypeRow>({
  name: 'CatalogTraitType',
  tableName: 'catalog_trait_types',
  properties: {
    trait: { type: 'string', columnType: 'text', primary: true },
    personalityType: { type: 'string', columnType: 'text' },
  },
});
