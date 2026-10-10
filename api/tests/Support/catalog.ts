import { randomUUID } from 'node:crypto';
import { EntityManager } from '@mikro-orm/postgresql';
import { Answer } from '@Huemans/Catalog/Domain/Answer';
import { Icebreaker } from '@Huemans/Catalog/Domain/Icebreaker';
import { Question } from '@Huemans/Catalog/Domain/Question';
import { AnswerCollection } from '@Huemans/Catalog/Domain/ValueObject/AnswerCollection';
import { AnswerId } from '@Huemans/Catalog/Domain/ValueObject/AnswerId';
import { AnswerText } from '@Huemans/Catalog/Domain/ValueObject/AnswerText';
import { IcebreakerId } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerId';
import { IcebreakerText } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerText';
import { IcebreakerTraitCollection } from '@Huemans/Catalog/Domain/ValueObject/IcebreakerTraitCollection';
import { QuestionId } from '@Huemans/Catalog/Domain/ValueObject/QuestionId';
import { QuestionText } from '@Huemans/Catalog/Domain/ValueObject/QuestionText';
import { Theme } from '@Huemans/Catalog/Domain/ValueObject/Theme';
import { CatalogContent } from '@Huemans/Catalog/Infrastructure/Seed/CatalogContent';
import { CatalogAnswerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogAnswerSchema';
import { CatalogIcebreakerSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogIcebreakerSchema';
import { CatalogQuestionSchema } from '@Huemans/Catalog/Infrastructure/Persistence/MikroOrm/CatalogQuestionSchema';
import { DEFAULT_CATALOG_FILES, readCatalogFiles } from '@Huemans/Catalog/Infrastructure/Seed/CatalogFiles';
import { MikroOrmCatalogSeeder } from '@Huemans/Catalog/Infrastructure/Seed/MikroOrmCatalogSeeder';
import { Trait, TraitValue } from '@Huemans/Shared/Domain/ValueObject/Trait';

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
  return Question.author(
    new QuestionId(id),
    new Theme('home'),
    new QuestionText(`Question ${id}`),
    new AnswerCollection(
      traits.map(
        (trait, index) =>
          new Answer(new AnswerId(`${id}-${'abcd'[index]}`), new AnswerText(`Answer ${index}`), new Trait(trait)),
      ),
    ),
  );
}

export function anIcebreaker(traits: TraitValue[] = ['creative', 'nostalgic'], id = `i-${randomUUID()}`): Icebreaker {
  return Icebreaker.author(
    new IcebreakerId(id),
    new Theme('food'),
    new IcebreakerText(`Icebreaker ${id}`),
    new IcebreakerTraitCollection(traits.map((trait) => new Trait(trait))),
  );
}

/** Removes every question and icebreaker fixture, leaving the real content in place. */
export async function removeCatalogFixtures(em: EntityManager): Promise<void> {
  await em.nativeDelete(CatalogAnswerSchema, { questionId: { $like: 'q-%' } });
  await em.nativeDelete(CatalogQuestionSchema, { id: { $like: 'q-%' } });
  await em.nativeDelete(CatalogIcebreakerSchema, { id: { $like: 'i-%' } });
}
