import { randomUUID } from 'node:crypto';
import type { Icebreaker } from '@Huemans/Catalog/Infrastructure/Content/IcebreakerList';
import type { Question } from '@Huemans/Catalog/Infrastructure/Content/QuestionList';
import { CatalogContent } from '@Huemans/Catalog/Infrastructure/Seed/CatalogContent';
import { DEFAULT_CATALOG_FILES, readCatalogFiles } from '@Huemans/Catalog/Infrastructure/Seed/CatalogFiles';
import { MikroOrmCatalogSeeder } from '@Huemans/Catalog/Infrastructure/Seed/MikroOrmCatalogSeeder';
import type { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';

// Suites share the test database in parallel and never truncate the catalog: question and icebreaker
// fixtures get random ids, and profiles and mapping (fixed keys) are only ever written with the real files.

export function realContent(): CatalogContent {
  return readCatalogFiles(DEFAULT_CATALOG_FILES);
}

/** Seeds the real content files; idempotent, so every suite that needs content can call it. */
export async function seedCatalogFiles(app: { get: (token: typeof MikroOrmCatalogSeeder) => MikroOrmCatalogSeeder }) {
  await app.get(MikroOrmCatalogSeeder).seed(realContent());
}

export function aQuestion(
  traits: [TraitValue, TraitValue, TraitValue, TraitValue] = ['dramatic', 'curious', 'practical', 'optimistic'],
  id = `q-${randomUUID()}`,
): Question {
  return {
    id,
    theme: 'home',
    text: `Question ${id}`,
    answers: traits.map((trait, index) => ({ id: `${id}-${'abcd'[index]}`, text: `Answer ${index}`, trait })),
  };
}

export function anIcebreaker(traits: TraitValue[] = ['creative', 'nostalgic'], id = `i-${randomUUID()}`): Icebreaker {
  return { id, theme: 'food', text: `Icebreaker ${id}`, traits };
}
