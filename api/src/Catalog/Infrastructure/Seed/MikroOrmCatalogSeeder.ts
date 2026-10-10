import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CatalogAnswerSchema } from '../Persistence/MikroOrm/CatalogAnswerSchema';
import { CatalogIcebreakerSchema } from '../Persistence/MikroOrm/CatalogIcebreakerSchema';
import { CatalogPersonalityTypeProfileSchema } from '../Persistence/MikroOrm/CatalogPersonalityTypeProfileSchema';
import { CatalogQuestionSchema } from '../Persistence/MikroOrm/CatalogQuestionSchema';
import { CatalogTraitTypeSchema } from '../Persistence/MikroOrm/CatalogTraitTypeSchema';
import { CatalogContent } from './CatalogContent';

/** Upserts validated content by key in one transaction. Never deletes: events keep the questions they picked. */
@Injectable()
export class MikroOrmCatalogSeeder {
  constructor(private readonly em: EntityManager) {}

  async seed({ questions, icebreakers, profiles, mapping }: Partial<CatalogContent>): Promise<void> {
    await this.em.transactional(async (em) => {
      if (questions?.length) {
        await em.upsertMany(
          CatalogQuestionSchema,
          questions.map(({ id, theme, text }) => ({ id, theme, text })),
        );
        await em.upsertMany(
          CatalogAnswerSchema,
          questions.flatMap((question) =>
            question.answers.map(({ id, text, trait }, position) => ({
              id,
              questionId: question.id,
              position,
              text,
              trait,
            })),
          ),
        );
      }
      if (icebreakers?.length) {
        await em.upsertMany(
          CatalogIcebreakerSchema,
          icebreakers.map(({ id, theme, text, traits }) => ({ id, theme, text, traits })),
        );
      }
      if (profiles?.length) {
        await em.upsertMany(
          CatalogPersonalityTypeProfileSchema,
          profiles.map(({ type, nickname, blurb, traits }) => ({ type, nickname, blurb, traits })),
        );
      }
      if (mapping) {
        await em.upsertMany(
          CatalogTraitTypeSchema,
          Object.entries(mapping).map(([trait, personalityType]) => ({ trait, personalityType })),
        );
      }
    });
  }
}
