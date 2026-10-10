import { randomUUID } from 'node:crypto';
import { ApplicationService as CatalogService } from '@Huemans/Catalog/Application/ApplicationService';
import type { Icebreaker } from '@Huemans/Types/Icebreaker';
import type { Question } from '@Huemans/Types/Question';
import type { TraitValue } from '@Huemans/Types/Trait';

// Random ids: suites share the test database in parallel and never truncate the catalog.
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

/** Seeds through the app's catalog service, for suites that need content to exist. */
export async function seedCatalog(
  app: { get: (token: typeof CatalogService) => CatalogService },
  questions: Question[],
  icebreakers: Icebreaker[] = [],
): Promise<void> {
  await app.get(CatalogService).seed(questions, icebreakers);
}
