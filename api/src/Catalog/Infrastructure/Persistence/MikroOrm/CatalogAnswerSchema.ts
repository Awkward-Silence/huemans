import { EntitySchema } from '@mikro-orm/core';

export interface CatalogAnswerRow {
  id: string;
  questionId: string;
  position: number;
  text: string;
  trait: string;
}

export const CatalogAnswerSchema = new EntitySchema<CatalogAnswerRow>({
  name: 'CatalogAnswer',
  tableName: 'catalog_answers',
  properties: {
    id: { type: 'string', columnType: 'text', primary: true },
    questionId: { type: 'string', columnType: 'text' },
    position: { type: 'integer' },
    text: { type: 'string', columnType: 'text' },
    trait: { type: 'string', columnType: 'text' },
  },
});
