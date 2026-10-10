import { ArrayType, EntitySchema } from '@mikro-orm/core';

export interface CatalogPersonalityTypeProfileRow {
  type: string;
  nickname: string;
  blurb: string;
  traits: string[];
}

export const CatalogPersonalityTypeProfileSchema = new EntitySchema<CatalogPersonalityTypeProfileRow>({
  name: 'CatalogPersonalityTypeProfile',
  tableName: 'catalog_personality_type_profiles',
  properties: {
    type: { type: 'string', columnType: 'text', primary: true },
    nickname: { type: 'string', columnType: 'text' },
    blurb: { type: 'string', columnType: 'text' },
    traits: { type: ArrayType, columnType: 'text[]' },
  },
});
