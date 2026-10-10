import { ArrayType, EntitySchema } from '@mikro-orm/core';

export interface CatalogIcebreakerRow {
  id: string;
  theme: string;
  text: string;
  traits: string[];
}

export const CatalogIcebreakerSchema = new EntitySchema<CatalogIcebreakerRow>({
  name: 'CatalogIcebreaker',
  tableName: 'catalog_icebreakers',
  properties: {
    id: { type: 'string', columnType: 'text', primary: true },
    theme: { type: 'string', columnType: 'text' },
    text: { type: 'text' },
    traits: { type: ArrayType, columnType: 'text[]' },
  },
});
