import { EntitySchema } from '@mikro-orm/core';

export interface CatalogQuestionRow {
  id: string;
  theme: string;
  text: string;
}

export const CatalogQuestionSchema = new EntitySchema<CatalogQuestionRow>({
  name: 'CatalogQuestion',
  tableName: 'catalog_questions',
  properties: {
    id: { type: 'string', columnType: 'text', primary: true },
    theme: { type: 'string', columnType: 'text' },
    text: { type: 'string', columnType: 'text' },
  },
});
