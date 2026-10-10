import { randomUUID } from 'node:crypto';
import { EntityManager } from '@mikro-orm/postgresql';
import type { Icebreaker } from '@Huemans/Catalog/Infrastructure/Content/IcebreakerList';
import type { Question } from '@Huemans/Catalog/Infrastructure/Content/QuestionList';
import { CatalogContent } from '@Huemans/Catalog/Infrastructure/Seed/CatalogContent';
import { CatalogAnswerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogAnswerSchema';
import { CatalogIcebreakerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogIcebreakerSchema';
import { CatalogQuestionSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogQuestionSchema';
import { DEFAULT_CATALOG_FILES, readCatalogFiles } from '@Huemans/Catalog/Infrastructure/Seed/CatalogFiles';
import { MikroOrmCatalogSeeder } from '@Huemans/Catalog/Infrastructure/Seed/MikroOrmCatalogSeeder';
import type { TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';

// Suites share the test database in parallel and never truncate the catalog: question and icebreaker
// fixtures get random ids under the `q-` and `i-` prefixes (real ids are `q0001`, `i0001`), and are removed by
// the suite that wrote them; profiles and mapping (fixed keys) are only ever written with the real files.

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

/** Removes every question and icebreaker fixture, leaving the real content in place. */
export async function removeCatalogFixtures(em: EntityManager): Promise<void> {
  await em.nativeDelete(CatalogAnswerSchema, { questionId: { $like: 'q-%' } });
  await em.nativeDelete(CatalogQuestionSchema, { id: { $like: 'q-%' } });
  await em.nativeDelete(CatalogIcebreakerSchema, { id: { $like: 'i-%' } });
}
